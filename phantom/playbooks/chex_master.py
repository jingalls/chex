"""
This is the master playbook for the phantom chrome extension

author: Joe Ingalls
created: 9/15/2016
requires:
    pdfkit
    zipfile
    IPy
    jinja2
    shutil
updated:
    9/27/2016	Started modifying the playbook to create reports per app_run instead of one massive report
    10/3/2016   Wrapped up the logic for working with Hashes, Domains and IP's.
"""
import phantom.rules as phantom
import json
import os
import pdfkit
import zipfile
import datetime
from IPy import IP
from jinja2 import Template, FileSystemLoader
from jinja2.environment import Environment
from shutil import copyfile
from operator import itemgetter
from itertools import groupby

REPORT_ROOT_DIR = '/home/phantom/reports/'
TEMPLATE_MAPPINGS = {
    'whois': {
        'html': 'whois_report.html',
        'pdf': 'whois_report.html'
    },
    'maxmind': {
        'html': 'maxmind_report.html',
        'pdf': 'maxmind_report.html'
    },
    'emerging threats': {
        'html': 'emergingthreats_report.html',
        'pdf': 'emergingthreats_report.html'
    }
}


def on_start(container):
    
    playbook_args = phantom.collect(container, 'artifact:args.cef.cs6', scope="all")
    if playbook_args:
        playbook_args = json.loads(playbook_args[0])
    
    artifacts = phantom.collect(container, 'artifact:chex.cef.*', scope='all')
    process_ips(container, playbook_args, [a['sourceAddress'] for a in artifacts if 'sourceAddress' in a])
    process_domains(container, playbook_args, [a['destinationDnsDomain'] for a in artifacts if 'destinationDnsDomain' in a])
    process_hashes(container, playbook_args, [a['fileHash'] for a in artifacts if 'fileHash' in a])
    process_urls(container, playbook_args, [a['requestURL'] for a in artifacts if 'requestURL' in a])


def process_ips(container, args, filtered_artifacts):
    parameters = []
    
    for ip_artifact in filtered_artifacts:
        if ip_artifact is None:
            continue
            
        ip = IP(ip_artifact)
        if ip.iptype() == "PUBLIC":
            parameters.append({
                'ip': ip_artifact,
                'context': {'artifact': ip_artifact},
            })

    if parameters:
        for act in args['actions']:
            if act.lower() == "whois":
                phantom.act("whois ip", parameters=parameters, assets=['whois'], name="whois_ip")
            elif act.lower() == "maxmind":
                phantom.act("geolocate ip", parameters=parameters, assets=['maxmind'], name="geolocate_ip")
            elif act.lower() == "virustotal":
                phantom.act("ip reputation", parameters=parameters, assets=['virustotal'], name="vt_ip_reputation")
            elif act.lower() == "emergingthreats":
                phantom.act("ip reputation", parameters=parameters, assets=['emergingthreats'], name="et_ip_reputation")


def process_domains(container, args, filtered_artifacts):
    parameters = []
    
    for domain_artifact in filtered_artifacts:
        if domain_artifact is None:
            continue
            
        parameters.append({
            'domain': domain_artifact,
            'context': {'artifact': domain_artifact},
        })

    if parameters:
        for act in args['actions']:
            if act.lower() == "whois":
                phantom.act("whois domain", parameters=parameters, assets=['whois'], name="whois_domain")
            elif act.lower() == "emergingthreats":
                phantom.act("domain reputation", parameters=parameters, assets=['emergingthreats'], name="et_domain_reputation")


def process_hashes(container, args, filtered_artifacts):
    parameters = []

    for hash_artifact in filtered_artifacts:
        if hash_artifact is None:
            continue

        parameters.append({
            'hash': hash_artifact,
            'context': {'artifact': hash_artifact},
        })

    if parameters:
        for act in args['actions']:
            if act.lower() == "emergingthreats":
                phantom.act("hash reputation", parameters=parameters, assets=['emergingthreats'], name="et_hash_reputation")


def process_urls(container, args, filtered_artifacts):
    pass

def generate_report_data(container, summary):
    """
    Generate the formatted template data to use in the report generation. Data
    will be grouped by the artifacts for simplicity.

    :param container: the container the playbook was run on
    :param summary: the playbook summary object containing the raw app_run results
    :return: dictionary object containing the container and artifact app_run results
    """
    summary_json = phantom.get_summary()
    summary_results = summary_json['result']
    
    # This will loop over loop over all of the action results and append them to a master array of results
    results = []
    for result in summary_results:
        action_run_id = result['id']
        action_results = phantom.get_action_results(action_run_id=action_run_id)
        results = results + action_results

    # Here we are looping over all of the results and creating a summarized object with the pertinent data
    summarized_data = []
    for app_run in results:
        for app_result in app_run["action_results"]:
            app_results = dict()
            app_results["app_name"] = app_run["app"]
            app_results["action"] = app_run["name"]
            app_results["status"] = app_result["status"]
            app_results["data"] = app_result["data"]
            app_results["message"] = app_result["message"]
            app_results["artifact"] = app_result["context"]["artifact"]
            summarized_data.append(app_results)
            
    # Group the summarized_data by the ip address and create a new dictionary of dictionaries with the ip's being the keys
    container_data = dict()
    container_data["container_id"] = container["id"]
    container_data["create_time"] = container["create_time"]
    container_data["due_time"] = container["due_time"]
    container_data["status"] = container["status"]
    container_data["severity"] = container["severity"]
    container_data["name"] = container["name"]
    container_data["label"] = container["label"]

    grouper = itemgetter("artifact")
    seq = sorted(summarized_data, key=grouper)
    artifact_data = []
    for key, grp in groupby(seq, grouper):
        temp_list = list(grp)
        temp_dict = dict()
        temp_dict[key] = temp_list

        artifact_data.append(temp_dict)
    
    return container_data, artifact_data


def generate_reports(container, summary):
    '''
    generate_report will take the template_data returned from generate_report_data
    and create the physical report from the specified template in the playbook
    arguments.
    '''
    args = phantom.collect(container, 'artifact:args.cef.cs6', scope="all")
    if args:
        args = json.loads(args[0])
        
    container_data, artifact_data = generate_report_data(container, summary)
    reports = []
    for data in artifact_data:
        for k, v in data.items():
            artifact = k
            for app_results in v:
                output_file = generate_app_report(container, artifact, container_data, app_results, args["report_format"])
                reports.append(output_file)

    zip_file = zip_reports(container)
    if zip_file is not None:
        report_dir = os.path.join(REPORT_ROOT_DIR, str(container["id"]))
        return save_to_vault(container, os.path.join(report_dir, zip_file), zip_file)

    return None


def generate_app_report(container, artifact, container_data, app_results, rpt_format):
    """
    Generate the report for the specific app run

    :param artifact: the artifact we are generating the report for
    :param app_results: the specific app_run results for the artifact
    :param rpt_data: the overall report data
    :param rpt_format: the requested format of the report
    :return: true if successful otherwise false

    :param container: the container object the playbook ran on
    :param artifact: the artifact we are generating the report for
    :param container_data: the json representation of the container object
    :param app_results: the specific app_run results for the artifact
    :param rpt_format: rpt_format: the requested format of the report
    :return: report output_filename if successful
    """
    app = app_results["app_name"].lower()
    output_file = "%s_%s.%s" % (app, artifact, "txt" if rpt_format.lower() == "text" else "html" if rpt_format.lower() == "html" else "pdf")

    # template = TEMPLATE_MAPPINGS[app][rpt_format.lower()]
    # with open('/home/phantom/templates/%s' % template, 'r') as template:
    #     template_body = template.read()
    #
    # output = Template(template_body)
    template_data = container_data.copy()
    template_data["artifacts"] = [app_results]
    # body = output.render(results=template_data)
    env = Environment()
    env.loader = FileSystemLoader('/home/phantom/templates')
    template = env.get_template(TEMPLATE_MAPPINGS[app][rpt_format.lower()])
    body = template.render(results=template_data)

    if save_report(container, body, output_file):
        return output_file

    return None


def save_report(container, report_body, filename):
    """
    This will save the report to the appropriate container directory
    under the /home/phantom/reports directory.

    :param container: the container object the playbook ran on
    :param report_body: the string body of the report file
    :param filename: the desired filename of the report
    :return: True if successful
    """
    container_dir = os.path.join(REPORT_ROOT_DIR, str(container["id"]))
    if not os.path.isdir(container_dir):
        os.makedirs(container_dir)
        
    type = "pdf"  if "pdf" in filename else "other"
    if type == "other":
        with open(os.path.join(container_dir, filename), "w") as f:
            if isinstance(report_body, list):
                body = "\n".join(report_body)
                f.write(body)
            else:
                f.write(report_body)
            
            f.close()
    elif type == "pdf":
        pdfkit.from_string(report_body, os.path.join(container_dir, filename))
        
    return True


def save_to_vault(container, file_path, filename):
    """
    Copy the report from the report directory to the vault's tmp directory.
    Add the report from the tmp directory to the container's vault.

    :param container: container we need to save the report to
    :param file_path: filepath to the initial report document
    :param filename: filename to attach to the new vault attachment
    :return: vault_id created from the phantom.Vault.add_attachment call
    """
    if os.path.isfile(file_path):
        vault_dir = "/vault/tmp/"
        
        try:
            copyfile(file_path, os.path.join(vault_dir, filename))
        except Exception as e:
            phantom.debug("Unable to copy file into vault/tmp, error: {0}".format(str(e)))
            return None
        
        res = phantom.Vault.add_attachment(os.path.join(vault_dir, filename), container['id'], filename)
        if res["message"] == "success":
            vault_id = res["vault_id"]
        else:
            phantom.debug(res)
            print "Adding the report failed."
            return None

    return vault_id


def zip_reports(container):
    try:
        report_dir = os.path.join(REPORT_ROOT_DIR, str(container["id"]))
        files = [f for f in os.listdir(report_dir) if os.path.isfile(os.path.join(report_dir, f)) and not f.endswith("zip")]

        zip_file_name = "%s-Phantom_Reports-%s.zip" % (container["id"], datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%s"))
        zipf = zipfile.ZipFile(os.path.join(report_dir, zip_file_name), 'w', zipfile.ZIP_DEFLATED)
        for f in files:
            zipf.write(os.path.join(report_dir, f), f)

        zipf.close()

        return zip_file_name
    except Exception as e:
        phantom.debug(e)
        return None

def on_finish(container, summary):

    playbook_args = phantom.collect(container, 'artifact:args.cef.cs6', scope="all")
    if playbook_args:
        playbook_args = json.loads(playbook_args[0])
    # This function is called after all actions are completed.
    # Summary and/or action results can be collected here.
    vault_id = generate_reports(container, summary)
    if vault_id is None:
        body = "Failed to create the reports. Please contact the Phantom Administrator for assistance."
        attachments = None
    else:
        body = "Attached is archive containing the Phantom Analysis Reports"
        attachments = str(vault_id)
    
    parameters = []
    parameters.append({
        "from": "Phantom Cyber <optiv.phantom@gmail.com>",
        "to": playbook_args["email_to"],
        "subject": "Phantom Analysis Results",
        "body": body,
        "attachments": attachments
    })

    phantom.act('send email', parameters=parameters, assets=['smtp (optiv gmail)'])

    return