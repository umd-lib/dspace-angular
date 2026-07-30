# DRUM Angular Customizations

## Introduction

This document contains information related to changes made to the stock DSpace
Angular code, to customize it for DRUM.

This document is intended to cover specific changes made to Angular behavior
that are outside of "normal" DSpace customization.

## Disabled "End User Agreement"

The "End User Agreement" is not needed, and so is disabled in the
"config/config.yml" file.

## About DRUM page

Added an "About DRUM" page at the "/info/drum-about" endpoint providing detailed
information about DRUM and its submission guidelines.

In the navigation bar menu, added an "About DRUM" link to the page (placed
immediately after the DRUM logo).

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

## Display Syndication Feed for "Recent Submissions"

Added a "Syndication Feed" button to the "Recent Submissions" section of the
home page, to allow users to access an RSS feeds of recent submissions.

## Modified GitHub Workflow Actions

Modified the following in ".github/workflows/build.yml" so that the GitHub jobs
would successfully complete:

* Commented out the "DOCKER_REGISTRY" environment variable and
  "Login to ${{ env.DOCKER_REGISTRY }}" step, because it was causing Docker
  image pulls to fail when running the
  "Start DSpace REST Backend via Docker (for e2e tests)" step.

* Modified the "Verify SSR" step for check for "DRUM" in the title instead of
  "DSpace"

* Commented out the "codecov" job, because UMD does not have an appropriate key
  for uploading the results to codecov.io.

## Change to Submission Form Validation Handling

The "updateForm" method in the "SubmissionSectionFormComponent" class
(src/app/submission/sections/form/section-form.component.ts) has been
modified to clear the form validation errors held by Angular when
receiving a form update from the back-end.

This change is intended to fix an issue (see LIBDRUM-909) in which submitting
a form without all the required fields populated would only show a brief
"flash" of the validation errors, and then not show GUI validation
warnings on all affected fields. This is apparently caused by a race condition
between the Angular validation handling, and a page refresh triggered by the
DSpace backend response.

It is unclear whether this is the optimal fix, so it has not been submitted
upstream to DSpace. Also, DSpace has been working on various similar fixes, so
the changes in this class should be re-evaluated on upgrades, and
removed if possible.
