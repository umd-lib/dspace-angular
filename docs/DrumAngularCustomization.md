# DRUM Angular Customizations

## Introduction

This document contains information related to changes made to the stock DSpace
Angular code, to customize it for DRUM.

This document is intended to cover specific changes made to Angular behavior
that are outside of "normal" DSpace customization.

## Disabled "End User Agreement"

The "End User Agreement" is not needed, and so is disabled in the
"config/config.yml" file.

## "PRESERVATION" added to standard bundle list

The list of standard bundles has been augmented with a "PRESERVATION" bundle.

## Markdown enabled metadata display

Markdown rendering has been enabled for the "Note" (dc.description) field
on the simple item page, to enable bare URLs to be rendered as hyperlinks.

## Replaced DSpace logo on login page with DRUM logo

Replaced the DSpace logo on the login page with the DRUM logo to provide
consistent branding of the application.

## Added "Submit item to DRUM" link in navigation bar

To make it more obvious how to submit items to DRUM, added a
"Submit item to DRUM" menu entry in the navigation bar. This menu entry is only
displayed for logged-in users that have "submit" permission to at least one
collection. It is essentially a duplicate of the "New | Item" menu
entry in the administrative sidebar.

## Uncommented "/browse/*" endpoints in "robots.txt"

In the "src/robots.txt.ejs" file, uncommented the "/browse/*" endpoints, to
dissuade crawlers from those URLs.

## Suppress display of "License bundle" files on full item pages

By default in DSpace the full detail page for an item contains a
"License bundle" section displaying the license file and enabling it to be
downloaded.

While the majority of the license files are simply the standard DRUM license,
users have the ability to upload their own license files, which may contain
personal information such as email addresses.

In DSpace 6, the license file was not downloadable, and we are continuing that
policy in DSpace 7 and later, to avoid potentially exposing user-specific
information.

Note: It does not seem possible in DSpace to restrict the download of files in
the "License bundle", as it is in the "Original bundle", so if a user knows the
specific URL of the license file, they will still be able to download it. This
is currently no particular concern about this, as the the URLs of the license
files contain UUID-like opaque identifiers that are unlikely to be guessable.

## Modified GitHub Workflow Actions

Modified the following in ".github/build.yml" so that the GitHub jobs would
successfully complete:

* Modified the "Verify SSR" step for check for "DRUM" in the title instead of
  "DSpace"

* Commented out the "codecov" job, because UMD does not have an appropriate key
  for uploading the results to codecov.io.
