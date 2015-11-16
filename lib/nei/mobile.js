/*
 * Mobile Builder
 * @module   nei/mobile
 * @author   genify(caijf@corp.netease.com)
 */
var path  = require('path'),
    util  = require('util'),
    _util  = require('../util/util.js');
// template root
var TPL_ROOT = __dirname+'/mobile/template/';
// mobile build
var Mobile = module.exports
    = require('../util/klass.js').create();
var pro = Mobile.extend(require('./builder.js'));
/**
 * filter config field from input
 * @param  {Object} config - config data
 * @return {Object} result will be save to config file
 */
pro._filter = function(config){
    this._super(config);
    // TODO
};
/**
 * init template
 * @return {Void}
 */
pro._template = function(){
    this._super();
    this._parseTemplate(TPL_ROOT);
};
/**
 * format config data
 * @protected
 * @param  {Object} data - config data
 * @return {Void}
 */
pro._format = function(data){
    this._super(data);
    // TODO
};
/**
 * build project
 * @param  {Object}  config - config object, parameters return from this.config api
 * @param  {Number}  config.id - project id
 * @param  {String}  config.webRoot - absolute path of web root
 * @param  {String}  config.viewRoot - absolute path of server template root
 * @param  {Object}  options - build options
 * @param  {Boolean} options.overwrite - whether overwrite mode
 * @param  {Number}  options.checkTime - last update check time
 * @param  {Object}  data - data config from nei platform
 * @param  {Array}   data.pages - page object list, eg. [{id,path,params,updateTime}]
 * @param  {Array}   data.templates - template object list, eg. [{id,path,params,updateTime}]
 * @param  {Array}   data.interfaces - interface object list, eg. [{id,path,method,isRest,input,output}]
 * @return {Void}
 */
pro._build = function(config,options,data){
    // TODO
};
/**
 * update project
 * @param  {Object}  config - config object, parameters return from this.config api
 * @param  {Number}  config.id - project id
 * @param  {Object}  options - update options
 * @param  {Boolean} options.overwrite - whether overwrite mode
 * @param  {Number}  options.checkTime - last update check time
 * @param  {Object}  data - data config from nei platform
 * @param  {Array}   data.pages - page object list, eg. [{id,path,params,updateTime}]
 * @param  {Array}   data.templates - template object list, eg. [{id,path,params,updateTime}]
 * @param  {Array}   data.interfaces - interface object list, eg. [{id,path,method,isRest,input,output}]
 * @return {Void}
 */
pro._update = function(config,options,data){
    // TODO
};
/**
 * do something before build done
 * @param  {Object} config - nei config will be outputted
 * @return {Void}
 */
pro._beforeDone = function(config){
    // TODO
};
/**
 * export model
 * @param  {Object} config - config object
 * @param  {String} config.lang   - output language
 * @param  {String} config.author - author name
 * @param  {String} config.namePrefix  - Class Name Prefix
 * @param  {String} config.reqAbstract - Request Class Abstract Name
 * @return {Void}
 */
pro.model = function(config){
    // check language
    var func = {
        oc:this._modelOC,
        java:this._modelJava
    }[
        config.lang
    ];
    if (!func){
        this.emit('error',{
            data:[config.lang],
            message:'not supported language %s'
        });
        this.emit('done');
        return;
    }
    // save config
    var time = new Date();
    this._modConf = {
        prefix:config.namePrefix||'',
        base:config.reqAbstract||'',
        author:config.author,
        year:time.getFullYear(),
        month:time.getMonth()+1,
        day:time.getDate()
    };
    // load config from nei
    this._loadConfig(func);
};
/**
 * generator Object-C model source code
 * @protected
 * @param  {Object}  config - config object, parameters return from this.config api
 * @param  {Number}  config.id - project id
 * @param  {String}  config.proRoot - project root
 * @param  {Object}  options - update options
 * @param  {Boolean} options.overwrite - whether overwrite mode
 * @param  {Object}  data - data config from nei platform
 * @param  {Array}   data.pages - page object list, eg. [{id,path,params,updateTime}]
 * @param  {Array}   data.templates - template object list, eg. [{id,path,params,updateTime}]
 * @param  {Array}   data.interfaces - interface object list, eg. [{id,path,method,isRest,input,output}]
 * @return {Void}
 */
pro._exportModelOC = (function(){
    var tmap = {
        10000:{typeName:'id',refName:'strong'},
        10001:{typeName:'NSString',refName:'copy'},
        10002:{typeName:'double',refName:'assign',noStar:!0},
        10003:{typeName:'BOOL',refName:'assign',noStar:!0}
    };
    var formatProp = function(type){
        // check properties
        if (!type.props){
            type.props = [];
            // format properties
            var arr = type.attrs||[];
            arr.forEach(
                function(attr){
                    var conf = tmap[attr.type];
                    if (!conf){
                        var it = this._types[attr.type];
                        conf = {
                            refName:'strong',
                            typeName:this._modConf.prefix+it.name
                        }
                    }
                    var prop = _util.merge(conf,attr);
                    // check for Array
                    if (prop.isArray==1){
                        prop.typeName = 'NSArray<'+prop.typeName+' *>';
                    }
                    type.props.push(prop);
                },this
            );
        }
        return type;
    };
    return function(config,options,data){
        // build data type model
        var root = config.proRoot+'Model/',
            conf = this._modConf||{};
        Object.keys(this._types).forEach(
            function(id){
                // ignore system type
                if (!!tmap[id]){
                    return;
                }
                // check type
                var type = formatProp.call(
                        this,this._types[id]
                    ),
                    prefix = root+conf.prefix+type.name+'.';
                // output xx.m and xx.h
                ['m','h'].forEach(
                    function(ext){
                        var file = prefix+ext,
                            content = this._mergeTemplate(
                                TPL_ROOT+'oc/model.'+ext,{
                                    conf:conf,
                                    type:type
                                }
                            );
                        this._output(file,content);
                    },this
                );
            },this
        );
    };
})();
/**
 * generator Object-C request source code
 * @protected
 * @param  {Object}  config - config object, parameters return from this.config api
 * @param  {Number}  config.id - project id
 * @param  {String}  config.proRoot - project root
 * @param  {Object}  options - update options
 * @param  {Boolean} options.overwrite - whether overwrite mode
 * @param  {Object}  data - data config from nei platform
 * @param  {Array}   data.pages - page object list, eg. [{id,path,params,updateTime}]
 * @param  {Array}   data.templates - template object list, eg. [{id,path,params,updateTime}]
 * @param  {Array}   data.interfaces - interface object list, eg. [{id,path,method,isRest,input,output}]
 * @return {Void}
 */
pro._exportRequestOC = function(config,options,data){
    // TODO



};
/**
 * generator Object-C source code
 * @protected
 * @param  {Object}  config - config object, parameters return from this.config api
 * @param  {Number}  config.id - project id
 * @param  {String}  config.proRoot - project root
 * @param  {Object}  options - update options
 * @param  {Boolean} options.overwrite - whether overwrite mode
 * @param  {Object}  data - data config from nei platform
 * @param  {Array}   data.pages - page object list, eg. [{id,path,params,updateTime}]
 * @param  {Array}   data.templates - template object list, eg. [{id,path,params,updateTime}]
 * @param  {Array}   data.interfaces - interface object list, eg. [{id,path,method,isRest,input,output}]
 * @return {Void}
 */
pro._modelOC = function(config,options,data){
    this._exportModelOC(config,options,data);
    this._exportRequestOC(config,options,data);
};
/**
 * generator Java source code
 * @protected
 * @param  {Object}  config - config object, parameters return from this.config api
 * @param  {Number}  config.id - project id
 * @param  {String}  config.proRoot - project root
 * @param  {Object}  options - update options
 * @param  {Boolean} options.overwrite - whether overwrite mode
 * @param  {Object}  data - data config from nei platform
 * @param  {Array}   data.pages - page object list, eg. [{id,path,params,updateTime}]
 * @param  {Array}   data.templates - template object list, eg. [{id,path,params,updateTime}]
 * @param  {Array}   data.interfaces - interface object list, eg. [{id,path,method,isRest,input,output}]
 * @return {Void}
 */
pro._modelJava = function(config,options,data){
    // TODO
};