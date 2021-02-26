var module = (function() {
    var _id = "", _blocks = {};
    var _filename = "";

    function _parse_text_to_blocks(text) {
        var blocks = [], block = "", attrs = {};

        text.split("\n").forEach(function(line) {
            var matched = line.match(/\s*=begin\s+sbml\s*(?::(.*))?/)

            if (matched) {
                if (block) {
                    blocks.push([ block, attrs ]);
                }

                block = "", attrs = {};

                if (matched[1]) {
                    attrs = _parse_text_to_attrs(matched[1]);
                }
            }

            block += line + "\n";
        });

        if (block) {
            blocks.push([ block, attrs ]);
        }

        return blocks;
    }

    function _parse_text_to_attrs(text) {
        var attrs = {};

        text.split(",").forEach(function(text) {
            var tuple = text.split("=");

            if (tuple.length === 2) {
                attrs[tuple[0].trim()] = tuple[1].trim();
            }
        });

        return attrs;
    }

    return {
        initialize: function(id) {
            _id = id;

            return this;
        },

        load: function(filename, data) {
            read("catalog@resource", filename)
                .then(function(text) {
                    var blocks = _parse_text_to_blocks(text);
                    var sbss = filename.replace(".sbml", ".sbss");

                    view.object(_id).action("clear");
                    blocks.forEach(function([ block, attrs ]) {
                        var text = "=import " + sbss + "\n" + block
                        var sbml_id = attrs["sbml-id"]
                
                        view.object(_id).action("load", Object.assign(data || {}, {
                            "text": text,
                            "sbml-id": sbml_id || ""
                        }));

                        if (sbml_id) {
                            _blocks[sbml_id] = block;
                        }
                    });

                    _filename = filename;
                });
        },

        update: function(sbml_id, data) {
            if (_blocks.hasOwnProperty(sbml_id)) {
                var sbss = _filename.replace(".sbml", ".sbss");
                var text = "=import " + sbss + "\n" + _blocks[sbml_id]
    
                view.object(_id).action("load", Object.assign(data || {}, {
                    "text": text,
                    "sbml-id": sbml_id
                }));
            }
        },

        clear: function(sbml_id) {
            if (sbml_id) {
                view.object(_id).action("load", {
                    "text":"=begin blank\n=end blank",
                    "sbml-id": sbml_id
                })
            } else {
                view.object(_id).action("clear");
            }
        },
    }
})();

__MODULE__ = module;
