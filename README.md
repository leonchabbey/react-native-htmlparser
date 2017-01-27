# react-native-htmlparser

### Why?
I did not find any working solution, so I looked for existing packages. 
None of them were working properly, so I decided to make my own from other packages' parts that I found interesting and usable. This package depends on @kodefox's parse5 react-native version, and is inspired by @siuying's htmltext.

Check their packages out:
- @kodefox - [react-native-parse-html]
- @siuying - [react-native-htmltext]

### Example
This is how you use it
```jsx
import HtmlParser from 'react-native-htmlparser'

<HtmlParser containerStyle={{}} tagsStyle={{}} html={}/>
```

|       Props         |   Type     | Information                                                                                     |   |   |
|----------------|:--------:|-----------------------------------------------------------------------------------------|---|---|
| containerStyle | array  | Style that will apply on the main View that wraps the parsed html                                               |   |   |
| tagsStyle      | array  | Styles that will be applied to their corresponding html tags (blocks and inlines) |   |   |
| html           | String | Your HTML content that needs to be parsed                                               |   |   |

There is a special tag you can use, it's **general**. Its attributes will be applied to every html tags (block and inline tags).
```jsx
var tagsStyle = {
general: {
fontFamily: "Roboto"
},
p: {
marginBottom: 15
}
}
```

[react-native-htmltext]: <https://github.com/siuying/react-native-htmltext>
[react-native-parse-html]: <https://github.com/kodefox/react-native-parse-html>
