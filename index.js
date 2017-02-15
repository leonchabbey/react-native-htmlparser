import parse5 from 'react-native-parse-html';
import React, { Component, PropTypes } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';

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

const STYLE_EQUIVALENCE = {
	color: {
		key: 'color',
	},
	'font-family': {
		key: 'fontFamily'
	},
	'font-size': {
		key: 'fontSize',
		transformValue: parseInt,
	},
	'font-style': {
		key: 'fontStyle',
	},
	'font-weight': {
		key: 'fontWeight',
	},
	'text-align': {
		key: 'textAlign'
	},
	'text-decoration': {
		key: 'textDecorationLine',
		acceptableValues: ['none', 'underline', 'line-through', 'underline line-through']
	},
	'line-height': {
		key: 'lineHeight',
		transformValue: parseInt,
	},
	'letter-spacing': {
		key: 'letterSpacing',
		transformValue: parseInt,
	}
};

const DEFAULT_STYLES = StyleSheet.create({
	a: {
		color: '#4169e1',
		...Platform.select({
			android: {
				textDecorationLine: 'underline',
			},
			ios: {
				fontWeight: 'bold',
			}
		}),
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

	decodeStyle(customStyle) {
		const elements = {};

		const splitedStyles = customStyle.split(',');

		for (let i = 0; i < splitedStyles.length; i++) {
			const split = splitedStyles[i].split(':');

			const identifier = STYLE_EQUIVALENCE[split[0].trim()];
			const value = split[1].trim().replace(/'/g, '');

			if (identifier) {
				const finalValue = identifier.transformValue 
							? identifier.transformValue(value) 
							: value;

					
				console.log(`${identifier.key}: ${finalValue}`);

				if (
					!identifier.acceptableValues ||
					(
						identifier.acceptableValues &&
						(
							identifier.acceptableValues.length === 0 ||
							identifier.acceptableValues.indexOf(finalValue) > -1
						)
					)
				) {
					elements[identifier.key] = finalValue;
				}
			} else {
				console.log(`${split[0]}: ${value}`);
				console.log('No attribute for this');
			}
		}

		console.log(elements);

		return elements;
	}

	styleForTag(opts) {
		const { tagName, extraStyle } = opts;

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

		if (extraStyle) {
			styles.push(extraStyle);
		}

		return styles;
	}

	processNode(node, parentKey) {
		const tagName = node.nodeName;

		if (this.isText(tagName)) {
			const key = `${parentKey}_text`;
			return (<Text key={key}>{node.value}</Text>);
		}

		let extraStyle = null;
		if (node.attrs.length > 0) {
			node.attrs.forEach((element) => {
				if (element.name === 'style') {
					extraStyle = this.decodeStyle(element.value);
				}
			});
		}

		if (this.isInlineElement(tagName)) {
			const key = `${parentKey}_${tagName}`;
			const children = [];

			node.childNodes.forEach((childNode, index) => {
				if (this.isInlineElement(childNode.nodeName) || this.isText(childNode.nodeName)) {
					children.push(this.processNode(childNode, `${key}_${index}`));
				}
			});

			return (
				<Text 
					key={key} 
					style={this.styleForTag({ tagName, extraStyle })}
				>
					{children}
				</Text>
			);
		}

		if (this.isBlockElement(tagName)) {
			const key = `${parentKey}_${tagName}`;
			const children = [];
			let lastInlineNodes = [];

			node.childNodes.forEach((childNode, index) => {
				const child = this.processNode(childNode, `${key}_${index}`);
				if (this.isInlineElement(childNode.nodeName) || this.isText(childNode.nodeName)) {
					lastInlineNodes.push(child);
				} else if (this.isBlockElement(childNode.nodeName)) {
					if (lastInlineNodes.length > 0) {
						children.push(<Text key={`${key}_${index}_inline`}>{lastInlineNodes}</Text>);
						lastInlineNodes = [];
					}
					children.push(child);
				}
			});

			if (lastInlineNodes.length > 0) {
				children.push((<Text key={`${key}_last_inline`}>{lastInlineNodes}</Text>));
			}

			return (
				<Text key={key} style={this.styleForTag({ tagName, extraStyle })}>
					{tagName === 'li'
						? <Text>&bull; <Text>{children}</Text>{'\n'}</Text>
						: children
					}
				</Text>
			);
		}
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
