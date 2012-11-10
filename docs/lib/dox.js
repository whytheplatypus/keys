

(function(){

  // Set default options
  marked.setOptions({
    gfm: true,
    pedantic: false,
    sanitize: true,
    // callback for code highlighter
    highlight: function(code, lang) {
      if (lang === 'js') {
        return javascriptHighlighter(code);
      }
      return code;
    }
  });

  /*
   * Utils
  */

  var escape = function(html){
    return String(html)
      .replace(/&(?!\w+;)/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };


  /*!
   * Module dependencies.
   */
  var exports = {};

  //var markdown = require('github-flavored-markdown').parse
  //  , escape = require('./utils').escape;

  /**
   * Library version.
   */

  exports.version = '0.3.2';



  /**
   * Parse comments in the given string of `js`.
   *
   * @param {String} js
   * @param {Object} options
   * @return {Array}
   * @see exports.parseComment
   * @api public
   */

  exports.parseComments = function(js, options){
    options = options || {};
    js = js.replace(/\r\n/gm, '\n');

    var comments = []
      , raw = options.raw
      , comment
      , buf = ''
      , ignore
      , withinMultiline = false
      , withinSingle = false
      , code;

    for (var i = 0, len = js.length; i < len; ++i) {
      // start comment
      if (!withinMultiline && !withinSingle && '/' == js[i] && '*' == js[i+1]) {
        // code following previous comment
        if (buf.trim().length) {
          comment = comments[comments.length - 1];
          if(comment) {
            comment.code = code = buf.trim();
            comment.ctx = exports.parseCodeContext(code);
          }
          buf = '';
        }
        i += 2;
        withinMultiline = true;
        ignore = '!' == js[i];
      // end comment
      } else if (withinMultiline && !withinSingle && '*' == js[i] && '/' == js[i+1]) {
        i += 2;
        buf = buf.replace(/^ *\* ?/gm, '');
        var comment = exports.parseComment(buf, options);
        comment.ignore = ignore;
        comments.push(comment);
        withinMultiline = ignore = false;
        buf = '';
      } else if (!withinSingle && !withinMultiline && '/' == js[i] && '/' == js[i+1]) {
        withinSingle = true;
        buf += js[i];
      } else if (withinSingle && !withinMultiline && '\n' == js[i]) {
        withinSingle = false;
        buf += js[i];
      // buffer comment or code
      } else {
        buf += js[i];
      }
    }

    if (comments.length === 0) {
      comments.push({
        tags: [],
        description: {full: '', summary: '', body: ''},
        isPrivate: false
      });
    }

    // trailing code
    if (buf.trim().length) {
      comment = comments[comments.length - 1];
      code = buf.trim();
      comment.code = code;
      comment.ctx = exports.parseCodeContext(code);
    }

    return comments;
  };

  /**
   * Parse the given comment `str`.
   *
   * The comment object returned contains the following
   *
   *  - `tags`  array of tag objects
   *  - `description` the first line of the comment
   *  - `body` lines following the description
   *  - `content` both the description and the body
   *  - `isPrivate` true when "@api private" is used
   *
   * @param {String} str
   * @param {Object} options
   * @return {Object}
   * @see exports.parseTag
   * @api public
   */

  exports.parseComment = function(str, options) {
    str = str.trim();
    options = options || {};

    var comment = { tags: [] }
      , raw = options.raw
      , description = {};

    // parse comment body
    description.full = str.split('\n@')[0].replace(/^([A-Z][\w ]+):$/gm, '## $1');
    description.summary = description.full.split('\n\n')[0];
    description.body = description.full.split('\n\n').slice(1).join('\n\n');
    comment.description = description;

    // parse tags
    if (~str.indexOf('\n@')) {
      var tags = '@' + str.split('\n@').slice(1).join('\n@');
      comment.tags = tags.split('\n').map(exports.parseTag);
      comment.isPrivate = comment.tags.some(function(tag){
        return 'api' == tag.type && 'private' == tag.visibility;
      })
    }

    // markdown
    if (!raw) {
      description.full = marked(description.full);
      description.summary = marked(description.summary);
      description.body = marked(description.body);
    }

    return comment;
  }

  /**
   * Parse tag string "@param {Array} name description" etc.
   *
   * @param {String}
   * @return {Object}
   * @api public
   */

  exports.parseTag = function(str) {
    var tag = {} 
      , parts = str.split(/ +/)
      , type = tag.type = parts.shift().replace('@', '');

    switch (type) {
      case 'param':
        tag.types = exports.parseTagTypes(parts.shift());
        tag.name = parts.shift() || '';
        tag.description = parts.join(' ');
        break;
      case 'return':
        tag.types = exports.parseTagTypes(parts.shift());
        tag.description = parts.join(' ');
        break;
      case 'see':
        if (~str.indexOf('http')) {
          tag.title = parts.length > 1
            ? parts.shift()
            : '';
          tag.url = parts.join(' ');
        } else {
          tag.local = parts.join(' ');
        }
      case 'api':
        tag.visibility = parts.shift();
        break;
      case 'type':
        tag.types = exports.parseTagTypes(parts.shift());
        break;
      case 'memberOf':
        tag.parent = parts.shift();
        break;
      case 'augments':
        tag.otherClass = parts.shift();
        break;
      case 'borrows':
        tag.otherMemberName = parts.join(' ').split(' as ')[0];
        tag.thisMemberName = parts.join(' ').split(' as ')[1];
        break;
      default:
        tag.string = parts.join(' ');
        break;
    }

    return tag;
  }

  /**
   * Parse tag type string "{Array|Object}" etc.
   *
   * @param {String} str
   * @return {Array}
   * @api public
   */

  exports.parseTagTypes = function(str) {
    return str
      .replace(/[{}]/g, '')
      .split(/ *[|,\/] */);
  };

  /**
   * Parse the context from the given `str` of js.
   *
   * This method attempts to discover the context
   * for the comment based on it's code. Currently
   * supports:
   *
   *   - function statements
   *   - function expressions
   *   - prototype methods
   *   - prototype properties
   *   - methods
   *   - properties
   *   - declarations
   *
   * @param {String} str
   * @return {Object}
   * @api public
   */

  exports.parseCodeContext = function(str){
    var str = str.split('\n')[0];

    // function statement
    if (/^function (\w+) *\(((\w+)*(, *\w+)*)\)/.exec(str)) {
      return {
          type: 'function'
        , name: RegExp.$1
        , string: RegExp.$1 + '('+RegExp.$2+')'
      };
    // function expression
    } else if (/^var *(\w+) *= *function *\(((\w+)*(, *\w+)*)\)/.exec(str)) {
      return {
          type: 'function'
        , name: RegExp.$1
        , string: RegExp.$1 + '('+RegExp.$2+')'
      };
    // prototype method
    } else if (/^(\w+)\.prototype\.(\w+) *= *function *\(((\w+)*(, *\w+)*)\)/.exec(str)) {
      return {
          type: 'method'
        , constructor: RegExp.$1
        , cons: RegExp.$1
        , name: RegExp.$2
        , string: RegExp.$1 + '.prototype.' + RegExp.$2 + '('+RegExp.$3+')'
      };
    // prototype property
    } else if (/^(\w+)\.prototype\.(\w+) *= *([^\n;]+)/.exec(str)) {
      return {
          type: 'property'
        , constructor: RegExp.$1
        , cons: RegExp.$1
        , name: RegExp.$2
        , value: RegExp.$3
        , string: RegExp.$1 + '.prototype' + RegExp.$2
      };
    // method
    } else if (/^([\w.]+)\.(\w+) *= *function *\(((\w+)*(, *\w+)*)\)/.exec(str)) {
      return {
          type: 'method'
        , receiver: RegExp.$1
        , name: RegExp.$2
        , string: RegExp.$1 + '.' + RegExp.$2 + '('+RegExp.$3+')'
      };
    // property
    } else if (/^(\w+)\.(\w+) *= *([^\n;]+)/.exec(str)) {
      return {
          type: 'property'
        , receiver: RegExp.$1
        , name: RegExp.$2
        , value: RegExp.$3
        , string: RegExp.$1 + '.' + RegExp.$2
      };
    // declaration
    } else if (/^var +(\w+) *= *([^\n;]+)/.exec(str)) {
      return {
          type: 'declaration'
        , name: RegExp.$1
        , value: RegExp.$2
        , string: RegExp.$1
      };
    }
  };


  /**
   * Expose api.
   */
  exports.api = function(comments){
    var buf = [];

    comments.forEach(function(comment){
      if (comment.isPrivate) return;
      if (comment.ignore) return;
      var ctx = comment.ctx;
      var desc = comment.description;
      if (!ctx) return;
      if (~desc.full.indexOf('Module dependencies')) return;
      if (!ctx.string.indexOf('module.exports')) return;
      buf.push('### ' + context(comment));
      buf.push('');
      buf.push(desc.full.trim().replace(/^/gm, '  '));
      buf.push('');
    });

    function context(comment) {
      var ctx = comment.ctx;
      var tags = comment.tags;
      switch (ctx.type) {
        case 'method':
          return (ctx.cons || ctx.receiver) + '#' + ctx.name + '(' + params(tags) + ')';
        default:
          return ctx.string;
      }
    }

    function params(tags) {
      return tags.filter(function(tag){
        return tag.type == 'param';
      }).map(function(param){
        return param.name + ':' + param.types.join('|');
      }).join(', ');
    }

    return buf.join('\n');
  };

  window.dox = exports;

})();
