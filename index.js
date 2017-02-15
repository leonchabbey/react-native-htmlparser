import parse5 from 'react-native-parse-html';
import React, { Component, PropTypes } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

const BLOCK_ELEMENTS = [
  'address', 'blockquote', 'center', 'dir', 'div', 'dl', 'fieldset', 'form',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'isindex', 'menu', 'noframes',
  'noscript', 'ol', 'p', 'pre', 'table', 'ul', 'li'
];

const INLINE_ELEMENTS = [
  'a', 'abbr', 'acronym', 'b', 'basefont', 'bdo', 'big', 'br', 'cite', 'code',
  'dfn', 'em', 'font', 'i', 'img', 'input', 'kbd', 'label', 'q', 's', 'samp',
  'select', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'textarea', 'tt', 'u', 'const'
];

const DEFAULT_STYLES = StyleSheet.create({
  a: {

  },
  b: {
    fontWeight: 'bold'
  },
  blockquote: {
    paddingLeft: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#cccccc',
    marginBottom: 12
  },
  br: {

  },
  code: {
    fontFamily: 'Courier'
  },
  div: {

  },
  em: {
    fontStyle: 'italic'
  },
  h1: {
    fontSize: 24,
  },
  h2: {
    fontSize: 20,
  },
  h3: {
    fontSize: 18,
  },
  h4: {
    fontSize: 17,
  },
  h5: {
    fontSize: 16,
  },
  h6: {
    fontSize: 15,
  },
  i: {
    fontStyle: 'italic'
  },
  p: {
    marginBottom: 12,
  },
  pre: {

  },
  strong: {
    fontWeight: 'bold'
  },
  q: {

  },
  span: {

  },
  sub: {

  },
  sup: {

  },
  ol: {
    marginLeft: 24,
  },
  ul: {
    marginLeft: 24,
  },
  u: {
    textDecorationLine: 'underline'
  },
  default: {
    marginBottom: 12
  }
});

const propTypes = {
  encapsulate: PropTypes.bool,
  html: PropTypes.string,
  tagsStyle: PropTypes.instanceOf(StyleSheet)
};

class HtmlParser extends Component {

  parse = (html) => parse5.parseFragment(html);
  isText = (tagName) => tagName === '#text';
  isBlockElement = tagName => BLOCK_ELEMENTS.indexOf(tagName) !== -1;
  isInlineElement = tagName => INLINE_ELEMENTS.indexOf(tagName) !== -1
  isEmpty = node => node.value.trim() === ''

  styleForTag(tagName) {
    const { tagsStyle } = this.props;
    const styles = [];

    if (DEFAULT_STYLES[tagName]) {
      styles.push(DEFAULT_STYLES[tagName]);
    } else {
      styles.push(DEFAULT_STYLES.default);
    }

    if (tagsStyle && tagsStyle.general) {
      styles.push(tagsStyle.general);
    }

    if (tagsStyle && tagsStyle[tagName]) {
      styles.push(tagsStyle[tagName]);
    }

    return styles;
  }

  processNode(node, parentKey) {
    const nodeName = node.nodeName;

    if (this.isText(nodeName)) {
      const key = `${parentKey}_text`;
      return (<Text key={key}>{node.value}</Text>);
    }

    if (this.isInlineElement(nodeName)) {
      const key = `${parentKey}_${nodeName}`;
      const children = [];
      node.childNodes.forEach((childNode, index) => {
        if (this.isInlineElement(childNode.nodeName) || this.isText(childNode.nodeName)) {
          children.push(this.processNode(childNode, `${key}_${index}`));
        } else {
          console.error(`Inline element ${nodeName} can only have inline children, ${child} is invalid!`);
        }
      });

      return (<Text key={key} style={this.styleForTag(nodeName)}>{children}</Text>);
    }

    if (this.isBlockElement(nodeName)) {
      const key = `${parentKey}_${nodeName}`;
      const children = [];
      let lastInlineNodes = [];

      node.childNodes.forEach((childNode, index) => {
        const child = this.processNode(childNode, `${key}_${index}`);
        if (this.isInlineElement(childNode.nodeName) || this.isText(childNode.nodeName)) {
          lastInlineNodes.push(child);
        } else if (this.isBlockElement(childNode.nodeName)) {
          if (lastInlineNodes.length > 0) {
            children.push(<Text key={`${key}_${index}_inline`}>{lastInlineNodes}</Text>)
            lastInlineNodes = [];
          }
          children.push(child);
        }
      });

      if (lastInlineNodes.length > 0) {
        children.push((<Text key={`${key}_last_inline`}>{lastInlineNodes}</Text>))
      }

      return (
        <Text key={key} style={this.styleForTag(nodeName)}>
          {nodeName === 'li'
            ? <Text>&bull; <Text>{children}</Text>{'\n'}</Text>
            : children
          }
        </Text>
      );
    }

    console.warn(`unsupported node: ${nodeName}`)
    return null;
  }

  render() {
    const html = this.props.html;
    const fragment = this.parse(this.props.encapsulate ? `<p>${html}</p>` : html);
    const rootKey = 'ht_';

    const children = [];
    fragment.childNodes.forEach((node, index) => {
      children.push(this.processNode(node, `${rootKey}_${index}`));
    });

    return (
      <View style={this.props.containerStyle}>
        {children}
      </View>
    );
  }
}

HtmlParser.propTypes = propTypes;

export default HtmlParser;
