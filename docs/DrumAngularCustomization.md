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

In the "src/robots.txt.ejs" file, uncommented the "/browse/*" endpoints, to dissuade
crawlers from those URLs.
