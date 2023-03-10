export type Frex = {
  "version": "0.1.0",
  "name": "frex",
  "instructions": [
    {
      "name": "createController",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "#1"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "#2"
          ]
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#3"
          ]
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#4",
            "Mint used as currency within the program"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#5"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#6"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#7"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "registerDomain",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "#1"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "#2"
          ]
        },
        {
          "name": "controller",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#3"
          ]
        },
        {
          "name": "domain",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#4"
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#5"
          ]
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#6"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#7"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#8"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#9"
          ]
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "createBuffer",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "#1"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "#2"
          ]
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#3"
          ]
        },
        {
          "name": "domain",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#4"
          ]
        },
        {
          "name": "buffer",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#5"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#6"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#7"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#8"
          ]
        }
      ],
      "args": [
        {
          "name": "version",
          "type": "u64"
        },
        {
          "name": "chunkNumber",
          "type": "u64"
        },
        {
          "name": "checksum",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        }
      ]
    },
    {
      "name": "createBufferChunk",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "#1"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "#2"
          ]
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#3"
          ]
        },
        {
          "name": "domain",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#4"
          ]
        },
        {
          "name": "buffer",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#5"
          ]
        },
        {
          "name": "bufferChunk",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#6"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#7"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#8"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#9"
          ]
        }
      ],
      "args": [
        {
          "name": "bufferVersion",
          "type": "u64"
        },
        {
          "name": "chunkNumber",
          "type": "u64"
        },
        {
          "name": "dataSize",
          "type": "u32"
        },
        {
          "name": "data",
          "type": {
            "array": [
              "u8",
              512
            ]
          }
        }
      ]
    },
    {
      "name": "setBufferReady",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "#1"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "#2"
          ]
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#3"
          ]
        },
        {
          "name": "domain",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#4"
          ]
        },
        {
          "name": "buffer",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#5"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#6"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#7"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#8"
          ]
        }
      ],
      "args": [
        {
          "name": "bufferVersion",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setDomainActiveBufferVersion",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "#1"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "#2"
          ]
        },
        {
          "name": "controller",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#3"
          ]
        },
        {
          "name": "domain",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#4"
          ]
        },
        {
          "name": "buffer",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#5"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#6"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#7"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#8"
          ]
        }
      ],
      "args": [
        {
          "name": "bufferVersion",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bufferChunk",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "chunkNumber",
            "type": "u64"
          },
          {
            "name": "dataSize",
            "type": "u32"
          },
          {
            "name": "data",
            "type": {
              "array": [
                "u8",
                512
              ]
            }
          }
        ]
      }
    },
    {
      "name": "buffer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "domain",
            "type": "publicKey"
          },
          {
            "name": "domainBump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u64"
          },
          {
            "name": "chunkNumber",
            "type": "u64"
          },
          {
            "name": "checksum",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "ready",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "controller",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "collateralMint",
            "type": "publicKey"
          },
          {
            "name": "collateralMintDecimals",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "domain",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "controller",
            "type": "publicKey"
          },
          {
            "name": "controllerBump",
            "type": "u8"
          },
          {
            "name": "vault",
            "type": "publicKey"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          },
          {
            "name": "activeBufferVersion",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "EventRegisterDomain",
      "fields": [
        {
          "name": "domain",
          "type": "publicKey",
          "index": true
        }
      ]
    },
    {
      "name": "EventSetDomainActiveBufferVersion",
      "fields": [
        {
          "name": "domain",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "buffer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bufferVersion",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "EventCreateBuffer",
      "fields": [
        {
          "name": "domain",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "buffer",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "EventSetBufferReady",
      "fields": [
        {
          "name": "domain",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "buffer",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "BumpError",
      "msg": "Bump error."
    },
    {
      "code": 6001,
      "name": "InvalidController",
      "msg": "Invalid controller."
    },
    {
      "code": 6002,
      "name": "InvalidCollateralMint",
      "msg": "Collateral mint does not match the controller's."
    },
    {
      "code": 6003,
      "name": "InvalidAuthority",
      "msg": "Authority does not match the controller's."
    },
    {
      "code": 6004,
      "name": "BufferMinChunkNumber",
      "msg": "Buffer must be constituted of at least one chunk."
    },
    {
      "code": 6005,
      "name": "BufferAlreadyReady",
      "msg": "Buffer is already ready."
    },
    {
      "code": 6006,
      "name": "BufferVersionAlreadyActiveForDomain",
      "msg": "Buffer version is already active for given domain."
    },
    {
      "code": 6007,
      "name": "BufferIsNotReady",
      "msg": "Buffer version is not ready."
    },
    {
      "code": 6008,
      "name": "Default",
      "msg": "Default - Check the source code for more info."
    }
  ]
};

export const IDL: Frex = {
  "version": "0.1.0",
  "name": "frex",
  "instructions": [
    {
      "name": "createController",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "#1"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "#2"
          ]
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#3"
          ]
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#4",
            "Mint used as currency within the program"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#5"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#6"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#7"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "registerDomain",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "#1"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "#2"
          ]
        },
        {
          "name": "controller",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#3"
          ]
        },
        {
          "name": "domain",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#4"
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#5"
          ]
        },
        {
          "name": "collateralMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#6"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#7"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#8"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#9"
          ]
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "createBuffer",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "#1"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "#2"
          ]
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#3"
          ]
        },
        {
          "name": "domain",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#4"
          ]
        },
        {
          "name": "buffer",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#5"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#6"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#7"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#8"
          ]
        }
      ],
      "args": [
        {
          "name": "version",
          "type": "u64"
        },
        {
          "name": "chunkNumber",
          "type": "u64"
        },
        {
          "name": "checksum",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        }
      ]
    },
    {
      "name": "createBufferChunk",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "#1"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "#2"
          ]
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#3"
          ]
        },
        {
          "name": "domain",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#4"
          ]
        },
        {
          "name": "buffer",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#5"
          ]
        },
        {
          "name": "bufferChunk",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#6"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#7"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#8"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#9"
          ]
        }
      ],
      "args": [
        {
          "name": "bufferVersion",
          "type": "u64"
        },
        {
          "name": "chunkNumber",
          "type": "u64"
        },
        {
          "name": "dataSize",
          "type": "u32"
        },
        {
          "name": "data",
          "type": {
            "array": [
              "u8",
              512
            ]
          }
        }
      ]
    },
    {
      "name": "setBufferReady",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "#1"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "#2"
          ]
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#3"
          ]
        },
        {
          "name": "domain",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#4"
          ]
        },
        {
          "name": "buffer",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#5"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#6"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#7"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#8"
          ]
        }
      ],
      "args": [
        {
          "name": "bufferVersion",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setDomainActiveBufferVersion",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "#1"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "#2"
          ]
        },
        {
          "name": "controller",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#3"
          ]
        },
        {
          "name": "domain",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "#4"
          ]
        },
        {
          "name": "buffer",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#5"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#6"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#7"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "#8"
          ]
        }
      ],
      "args": [
        {
          "name": "bufferVersion",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bufferChunk",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "chunkNumber",
            "type": "u64"
          },
          {
            "name": "dataSize",
            "type": "u32"
          },
          {
            "name": "data",
            "type": {
              "array": [
                "u8",
                512
              ]
            }
          }
        ]
      }
    },
    {
      "name": "buffer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "domain",
            "type": "publicKey"
          },
          {
            "name": "domainBump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u64"
          },
          {
            "name": "chunkNumber",
            "type": "u64"
          },
          {
            "name": "checksum",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "ready",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "controller",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "collateralMint",
            "type": "publicKey"
          },
          {
            "name": "collateralMintDecimals",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "domain",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "controller",
            "type": "publicKey"
          },
          {
            "name": "controllerBump",
            "type": "u8"
          },
          {
            "name": "vault",
            "type": "publicKey"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          },
          {
            "name": "activeBufferVersion",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "EventRegisterDomain",
      "fields": [
        {
          "name": "domain",
          "type": "publicKey",
          "index": true
        }
      ]
    },
    {
      "name": "EventSetDomainActiveBufferVersion",
      "fields": [
        {
          "name": "domain",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "buffer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bufferVersion",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "EventCreateBuffer",
      "fields": [
        {
          "name": "domain",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "buffer",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "EventSetBufferReady",
      "fields": [
        {
          "name": "domain",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "buffer",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "BumpError",
      "msg": "Bump error."
    },
    {
      "code": 6001,
      "name": "InvalidController",
      "msg": "Invalid controller."
    },
    {
      "code": 6002,
      "name": "InvalidCollateralMint",
      "msg": "Collateral mint does not match the controller's."
    },
    {
      "code": 6003,
      "name": "InvalidAuthority",
      "msg": "Authority does not match the controller's."
    },
    {
      "code": 6004,
      "name": "BufferMinChunkNumber",
      "msg": "Buffer must be constituted of at least one chunk."
    },
    {
      "code": 6005,
      "name": "BufferAlreadyReady",
      "msg": "Buffer is already ready."
    },
    {
      "code": 6006,
      "name": "BufferVersionAlreadyActiveForDomain",
      "msg": "Buffer version is already active for given domain."
    },
    {
      "code": 6007,
      "name": "BufferIsNotReady",
      "msg": "Buffer version is not ready."
    },
    {
      "code": 6008,
      "name": "Default",
      "msg": "Default - Check the source code for more info."
    }
  ]
};
