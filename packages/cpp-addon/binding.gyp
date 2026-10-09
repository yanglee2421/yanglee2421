{
  "targets": [
    {
      "target_name": "cpp_addon",
      "sources": [
        "<!@(node get-source-file.cjs)"
      ],
      "copies": [
        {
          "destination": "<(PRODUCT_DIR)",
          "files": [
            "<(module_root_dir)/lib/TOFDPort.dll",
            "<(module_root_dir)/lib/ftd2xx.dll",
            "<(module_root_dir)/lib/GainTable.ini",
          ]
        }
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "<(module_root_dir)/lib"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "libraries": [
        "<(module_root_dir)/lib/TOFDPort.lib"
      ],
      "conditions": [
        [
          "OS=='win'",
          {
            "msvs_settings": {
              "VCCLCompilerTool": {
                "ExceptionHandling": 1,
                "AdditionalOptions": [
                  "/utf-8"
                ]
              },
              "VCLinkerTool": {
                "AdditionalDependencies": [
                  "user32.lib",
                ]
              }
            }
          }
        ],
        [
          "OS=='linux'",
          {
            "cflags": [
              "-fpermissive",
              "-fexceptions"
            ],
            "cflags_cc": [
              "-fpermissive",
              "-fexceptions"
            ]
          }
        ]
      ]
    }
  ]
}
