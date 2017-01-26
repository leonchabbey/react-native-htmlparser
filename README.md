# react-native-htmlparser

### Why?
I did not find any working solution, so I searched for existing packages. 
None of them were workig properly so I fixed and merged them into one react-native-htmlparser. This new package depends on @kodefox's parse5 react-native version, and is inspired by @siuying htmltext converter.

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
| containerStyle | array  | Style that will apply on the main View                                                  |   |   |
| tagsStyle      | array  | Style that will apply on each inline tag that you can find in HTML Ex: p, i, a, br, ... |   |   |
| html           | String | Your HTML content that needs to be parsed                                               |   |   |

There is a special tags you can use, it's **general**. Its attributes will be applied to every html inline tags.
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
