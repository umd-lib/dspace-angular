import { escape } from 'lodash';
import { Item } from 'src/app/core/shared/item.model';

/**
 * A DSpace object that is not a Dataset
 */
export const notADataset = {
  'url': 'https://example.org/items/notADataset',
  'dspaceObject':
  Object.assign(new Item(),
    {
      'id': 'emptyDataset ID',
      'uuid': 'emptyDataset UUID',
      'name': '',
      'handle': '1903/99999',
      'metadata': {
        'dc.type': [
          {
            'value': 'Technical Report',
            'language': 'en_US',
          }
        ]
      },
    }
  ),
  'expectedJsonLd': ''
};

/**
 * A Dataset, with missing values for every field
 */
export const emptyDataset = {
  // The URL to use when constructing the JSON-LD object
  'url': 'https://example.org/items/emptyDataset',
  // The DSpaceObject to use
  'dspaceObject':
    Object.assign(new Item(),
      {
        'id': 'emptyDataset ID',
        'uuid': 'emptyDataset UUID',
        'name': '',
        'handle': '1903/99999',
        'metadata': {
          'dc.type': [
            {
              'value': 'Dataset',
              'language': 'en_US',
            }
          ]
        },
      }
    ),
  // The expected JSON-LD object
  'expectedJsonLd':
    {
      '@context' : 'http://schema.org',
      '@type' : 'Dataset',
      'name':'',
      'description':'',
      'url':'https://example.org/items/emptyDataset',
      'temporalCoverage':'',
      'creator': [],
      'identifier': [],
      'license': ''
    }
};

/**
 * A Dataset for verifying that each field is properly escaped.
 */
export const escapeTestDataset = {
  'url': 'https://example.org/items/escapeTestDataset',
  'dspaceObject':
    Object.assign(new Item(),
    {
      'id': 'escapeTestDataset ID',
      'uuid': 'escapeTestDataset UUID',
      'name': '',
      'handle': '1903/99998',
      'metadata': {
        'dc.contributor.author': [
          {
            'value': 'Pound, Marc </script><script>alert("XXS author1")</script>',
            'language': null,
          },
          {
            'value': 'Wolfire, Mark  </script><script>alert("XXS author2")</script>',
            'language': null,
          }
        ],
        'dc.date.issued': [
          {
            'value': '2022-08-31 </script><script>alert("XXS date")</script>',
            'language': null,
          }
        ],
        'dc.description': [
          {
            'value': 'escapeTestDataset Description </script><script>alert("XXS description")</script>',
            'language': 'en_US',
          }
        ],
        'dc.description.abstract': [
          {
            'value': 'escapeTestDataset Abstract </script><script>alert("XXS abstract")</script>',
            'language': 'en_US',
          }
        ],
        'dc.identifier': [
          {
            'value': 'https://doi.org/10.13016/hohs-ldyr </script><script>alert("XXS identifier")</script>',
            'language': null,
          }
        ],
        'dc.identifier.uri': [
          {
            'value': 'http://hdl.handle.net/1903/29105 </script><script>alert("XXS identifier")</script>',
            'language': null,
          }
        ],
        'dc.rights.uri': [
          {
            'value': 'http://creativecommons.org/publicdomain/zero/1.0/ </script><script>alert("XXS rights")</script>',
            'language': '*',
            'authority': null,
            'confidence': -1,
            'place': 0
          }
        ],
        'dc.title': [
          {
            'value': 'escapeTestDataset Title </script><script>alert("XXS rights")</script>',
            'language': 'en_US',
          }
        ],
        'dc.type': [
          {
            'value': 'Dataset',
            'language': 'en_US',
          }
        ]
      },
    }),
  'expectedJsonLd':
    {
      '@context' : 'http://schema.org',
      '@type' : 'Dataset',
      'name':'escapeTestDataset Title &lt;/script&gt;&lt;script&gt;alert(&quot;XXS rights&quot;)&lt;/script&gt;',
      'description': 'escapeTestDataset Abstract &lt;/script&gt;&lt;script&gt;alert(&quot;XXS abstract&quot;)&lt;/script&gt;',
      'url':'https://example.org/items/escapeTestDataset',
      'temporalCoverage':'2022-08-31 &lt;/script&gt;&lt;script&gt;alert(&quot;XXS date&quot;)&lt;/script&gt;',
      'creator': [
          {
              '@type': 'Person',
              'name': 'Pound, Marc &lt;/script&gt;&lt;script&gt;alert(&quot;XXS author1&quot;)&lt;/script&gt;'
          },
          {
              '@type': 'Person',
              'name': 'Wolfire, Mark  &lt;/script&gt;&lt;script&gt;alert(&quot;XXS author2&quot;)&lt;/script&gt;'
          }
      ],
      'identifier': [
        'http://hdl.handle.net/1903/29105 &lt;/script&gt;&lt;script&gt;alert(&quot;XXS identifier&quot;)&lt;/script&gt;',
        'https://doi.org/10.13016/hohs-ldyr &lt;/script&gt;&lt;script&gt;alert(&quot;XXS identifier&quot;)&lt;/script&gt;'
      ],
      'license':'http://creativecommons.org/publicdomain/zero/1.0/ &lt;/script&gt;&lt;script&gt;alert(&quot;XXS rights&quot;)&lt;/script&gt;'
    },
};

/**
 * A realistic Dataset from an actual DSpace object.
 */
export const fullDataset = {
  // The URL to use when constructing the JSON-LD object
  'url': 'https://example.org/items/fullDataset',
  // The DSpaceObject to use
  'dspaceObject':
    Object.assign(new Item(),
      {
        'id': 'ff20f203-99ef-4d9c-8c24-81d8aa4886dc',
        'uuid': 'ff20f203-99ef-4d9c-8c24-81d8aa4886dc',
        'name': 'Example code listings for the PhotoDissociation Region Toolbox',
        'handle': '1903/29105',
        'metadata': {
          'dc.contributor.author': [
            {
              'value': 'Pound, Marc',
              'language': null,
              'authority': null,
              'confidence': -1,
              'place': 0
            },
            {
              'value': 'Wolfire, Mark',
              'language': null,
              'authority': null,
              'confidence': -1,
              'place': 1
            }
          ],
          'dc.date.accessioned': [
            {
              'value': '2022-08-31T19:13:22Z',
              'language': null,
              'authority': null,
              'confidence': -1,
              'place': 0
            }
          ],
          'dc.date.available': [
            {
              'value': '2022-08-31T19:13:22Z',
              'language': null,
              'authority': null,
              'confidence': -1,
              'place': 0
            }
          ],
          'dc.date.issued': [
            {
              'value': '2022-08-31',
              'language': null,
              'authority': null,
              'confidence': -1,
              'place': 0
            }
          ],
          'dc.description': [
            {
              'value': 'We use a Github open-source public repository (https://github.com/mpound/pdrtpy) that includes the Python package code, text documentation files, and the FITS files of the models. Code is checked against the PEP8 coding style\r\nand regression and integration tests are run and at code check-in using Github Actions. For more info, see Pound & Wolfire (2022) and the github repo.',
              'language': 'en_US',
              'authority': null,
              'confidence': -1,
              'place': 0
            }
          ],
          'dc.description.abstract': [
            {
              'value': 'These are example code listings for the PhotoDissociation Region Toolbox (https://dustem.astro.umd.edu), and companion to the manuscript \'The PhotoDissociation Region Toolbox: Software and Models for Astrophysical Analysis\', by Pound & Wolfire (2022).  These code snippets show typical ways to use the Toolbox and reproduce most of the figures in the manuscript.   The code is written in Python 3 and demonstrate the pdrtpy Python package (https://pdrtpy.readthedocs.io).',
              'language': 'en_US',
              'authority': null,
              'confidence': -1,
              'place': 0
            }
          ],
          'dc.description.sponsorship': [
            {
              'value': '1. NASA Astrophysics Data Analysis Program award #80NSSC19K0573\r\n2. SOFIA Legacy Program, FEEDBACK, provided by NASA\r\nthrough award SOF070077 issued by USRA to the University of Maryland\r\n3. JWST-ERS program ID 1288 through a grant from the Space Telescope Science Institute under\r\nNASA contract NAS5-03127 to the University of Maryland.',
              'language': 'en_US',
              'authority': null,
              'confidence': -1,
              'place': 0
            }
          ],
          'dc.identifier': [
            {
              'value': 'https://doi.org/10.13016/hohs-ldyr',
              'language': null,
              'authority': null,
              'confidence': -1,
              'place': 0
            }
          ],
          'dc.identifier.uri': [
            {
              'value': 'http://hdl.handle.net/1903/29105',
              'language': null,
              'authority': null,
              'confidence': -1,
              'place': 0
            }
          ],
          'dc.language.iso': [
            {
              'value': 'en_US',
              'language': 'en_US',
              'authority': null,
              'confidence': -1,
              'place': 0
            }
          ],
          'dc.relation.isAvailableAt': [
            {
              'value': 'Astronomy',
              'language': 'en_us',
              'authority': null,
              'confidence': -1,
              'place': 0
            },
            {
              'value': 'College of Computer, Mathematical & Natural Sciences',
              'language': 'en_us',
              'authority': null,
              'confidence': -1,
              'place': 1
            },
            {
              'value': 'Digital Repository at the University of Maryland',
              'language': 'en_us',
              'authority': null,
              'confidence': -1,
              'place': 2
            },
            {
              'value': 'University of Maryland (College Park, MD)',
              'language': 'en_us',
              'authority': null,
              'confidence': -1,
              'place': 3
            }
          ],
          'dc.rights': [
            {
              'value': 'CC0 1.0 Universal',
              'language': '*',
              'authority': null,
              'confidence': -1,
              'place': 0
            }
          ],
          'dc.rights.uri': [
            {
              'value': 'http://creativecommons.org/publicdomain/zero/1.0/',
              'language': '*',
              'authority': null,
              'confidence': -1,
              'place': 0
            }
          ],
          'dc.subject': [
            {
              'value': 'photodissociation region',
              'language': 'en_US',
              'authority': null,
              'confidence': -1,
              'place': 0
            },
            {
              'value': 'Python data analysis',
              'language': 'en_US',
              'authority': null,
              'confidence': -1,
              'place': 1
            },
            {
              'value': 'interstellar gas',
              'language': 'en_US',
              'authority': null,
              'confidence': -1,
              'place': 2
            }
          ],
          'dc.title': [
            {
              'value': 'Example code listings for the PhotoDissociation Region Toolbox',
              'language': 'en_US',
              'authority': null,
              'confidence': -1,
              'place': 0
            }
          ],
          'dc.type': [
            {
              'value': 'Dataset',
              'language': 'en_US',
              'authority': null,
              'confidence': -1,
              'place': 0
            }
          ]
        },
        'inArchive': true,
        'discoverable': true,
        'withdrawn': false,
        'lastModified': '2022-09-01T15:59:14.970+00:00',
        'entityType': null,
        'type': 'item',
        '_links': {
          'accessStatus': {
            'href': 'http://localhost:8080/server/api/core/items/ff20f203-99ef-4d9c-8c24-81d8aa4886dc/accessStatus'
          },
          'bundles': {
            'href': 'http://localhost:8080/server/api/core/items/ff20f203-99ef-4d9c-8c24-81d8aa4886dc/bundles'
          },
          'mappedCollections': {
            'href': 'http://localhost:8080/server/api/core/items/ff20f203-99ef-4d9c-8c24-81d8aa4886dc/mappedCollections'
          },
          'owningCollection': {
            'href': 'http://localhost:8080/server/api/core/items/ff20f203-99ef-4d9c-8c24-81d8aa4886dc/owningCollection'
          },
          'relationships': {
            'href': 'http://localhost:8080/server/api/core/items/ff20f203-99ef-4d9c-8c24-81d8aa4886dc/relationships'
          },
          'version': {
            'href': 'http://localhost:8080/server/api/core/items/ff20f203-99ef-4d9c-8c24-81d8aa4886dc/version'
          },
          'templateItemOf': {
            'href': 'http://localhost:8080/server/api/core/items/ff20f203-99ef-4d9c-8c24-81d8aa4886dc/templateItemOf'
          },
          'thumbnail': {
            'href': 'http://localhost:8080/server/api/core/items/ff20f203-99ef-4d9c-8c24-81d8aa4886dc/thumbnail'
          },
          'self': {
            'href': 'http://localhost:8080/server/api/core/items/ff20f203-99ef-4d9c-8c24-81d8aa4886dc'
          }
        }
      }
    ),
  'expectedJsonLd':
    {
      '@context' : 'http://schema.org',
      '@type' : 'Dataset',
      'name':'Example code listings for the PhotoDissociation Region Toolbox',
      'description': escape('These are example code listings for the PhotoDissociation Region Toolbox (https://dustem.astro.umd.edu), and companion to the manuscript \'The PhotoDissociation Region Toolbox: Software and Models for Astrophysical Analysis\', by Pound & Wolfire (2022).  These code snippets show typical ways to use the Toolbox and reproduce most of the figures in the manuscript.   The code is written in Python 3 and demonstrate the pdrtpy Python package (https://pdrtpy.readthedocs.io).'),
      'url':'https://example.org/items/fullDataset',
      'temporalCoverage':'2022-08-31',
      'creator': [
          {
              '@type': 'Person',
              'name': 'Pound, Marc'
          },
          {
              '@type': 'Person',
              'name': 'Wolfire, Mark'
          }
      ],
      'identifier': [
      'http://hdl.handle.net/1903/29105','https://doi.org/10.13016/hohs-ldyr'
      ],
      'license': 'http://creativecommons.org/publicdomain/zero/1.0/'
    }
};
