import parse5 from 'react-native-parse-html'
import React, {Component} from "react"
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} from 'react-native'

var BLOCK_ELEMENTS = ["blockquote", "div", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "ol", "p", "pre", "ul", "li"]

var INLINE_ELEMENTS = ["b", "code", "i", "em", "strong", "a", "br", "q", "span", "sub", "sup"]

var DEFAULT_STYLES = StyleSheet.create({
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
    fontFamily: "Courier"
  },
  div: {

  },
  em: {
    fontStyle: 'italic'
  },
  h1: {
    fontWeight: 'bold',
  },
  h2: {
    fontWeight: 'bold',
  },
  h3: {
    fontWeight: 'bold',
  },
  h4: {
    fontWeight: 'bold',
  },
  h5: {
    fontWeight: 'bold',
  },
  h6: {
    fontWeight: 'bold',
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
  ol:{
    marginLeft: 24,
  },
  ul: {
    marginLeft: 24,
  },
  default: {

  }
})

class HtmlParser extends Component {
  parse = (html) => {
    var fragment = parse5.parseFragment(html)
    return fragment
  }

  isText = (tagName) => {
    return tagName === "#text"
  }

  isBlockElement = (tagName) => {
    return BLOCK_ELEMENTS.indexOf(tagName) != -1
  }

  isInlineElement = (tagName) => {
    return INLINE_ELEMENTS.indexOf(tagName) != -1
  }

  isEmpty = (node) => {
    return node.value.trim() == ""
  }

  styleForTag = (tagName) => {
    const {tagsStyle} = this.props
    var tagsStyleSheet = StyleSheet.create(tagsStyle)
    var style = tagsStyle
                  ? tagsStyleSheet[tagName]
                    ? tagsStyleSheet[tagName]
                    : DEFAULT_STYLES[tagName]
                      ? DEFAULT_STYLES[tagName]
                      : DEFAULT_STYLES["default"]
                  : DEFAULT_STYLES[tagName]
                    ? DEFAULT_STYLES[tagName]
                    : DEFAULT_STYLES["default"]

    return tagsStyle
            ? tagsStyleSheet["general"]
              ? [tagsStyleSheet["general"], style]
              : style
            : style
  }

  processNode = (node, parentKey) => {
    var nodeName = node.nodeName

    if (this.isText(nodeName)) {
      if (this.isEmpty(node)) {
        return null
      }

      var key = `${parentKey}_text`
      return (<Text key={key}>{node.value}</Text>)
    }

    if (this.isInlineElement(nodeName)) {
      var key = `${parentKey}_${nodeName}`
      var children = []
      node.childNodes.forEach((childNode, index) => {
        if (this.isInlineElement(childNode.nodeName) || this.isText(childNode.nodeName)) {
          children.push(this.processNode(childNode, `${key}_${index}`))
        } else {
          console.error(`Inline element ${nodeName} can only have inline children, ${child} is invalid!`)
        }
      })
      return (<Text key={key} style={this.styleForTag(nodeName)}>{children}</Text>)
    }

    if (this.isBlockElement(nodeName)) {
      var key = `${parentKey}_${nodeName}`
      var children = []
      var lastInlineNodes = []

      node.childNodes.forEach((childNode, index) => {
        var child = this.processNode(childNode, `${key}_${index}`)
        if (this.isInlineElement(childNode.nodeName) || this.isText(childNode.nodeName)) {
          lastInlineNodes.push(child)

        } else if (this.isBlockElement(childNode.nodeName)) {
          if (lastInlineNodes.length > 0) {
            children.push(<Text key={`${key}_${index}_inline`}>{lastInlineNodes}</Text>)  
            lastInlineNodes = []
          }
          children.push(child)
        }
      })

      if (lastInlineNodes.length > 0) {
        children.push((<Text key={`${key}_last_inline`}>{lastInlineNodes}</Text>))  
      }
      return (
        <Text key={key} style={this.styleForTag(nodeName)}>
          {children}
        </Text>
      )
    }

    console.warn(`unsupported node: ${nodeName}`)
    return null;
  }


  render() {
    var html = this.props.html
    var fragment = this.parse(html)
    var rootKey = "ht_"

    var children = []
    fragment.childNodes.forEach((node, index) => {
      children.push(this.processNode(node, `${rootKey}_${index}`))
    })

    return (
      <View style={this.props.containerStyle}>
        {children}
      </View>
    )
  }
}

export default HtmlParser