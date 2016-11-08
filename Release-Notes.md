# Phantom Chrome Extension

**Versions: 1.0 - 1.0.1**

**Updated: 2016-10-03**

---

## Description
The v1.0 release is the first initial release of the Phantom Chrome Extension for Optiv. It
allows for the submitting of IP's, Domains or Hashes to the Phantom environment for analysts/
enrichment purposes. Currently the following apps are utilized for the analysis purpose:

* Maxmind GeoLocation       (IP)
* WHOIS                     (IP, Domain)
* EmergingThreats           (IP, Domain, Hash)

Upon submission to Phantom, the analysis is ran and the report(s) will be emailed to the email
address that was supplied as part of the form submit process. The following report formats
are currently supported:

* HTML
* PDF

---

## v1.0.1

**Released: 2016-10-04 (Update release)

This release introduces changes to the request authorization to Phantom. The extension now uses
an auth token instead of a username/password. All current Instance Profiles will have to be
updated as the username/password fields no longer exist on the settings page.

## v1.0

**Released: 2016-10-03 (INITIAL RELEASE)