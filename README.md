## Gradr

Provides static code analysis and auto-grading for simple *Javascript* web projects.

This is based on the belief that checking the output of code during assessments is very insuffieicent. *Gradr* is attempting to take it further by using ASTs to statically evaluate code to determine if it was written according to specification.

#### How Does It Work?

Consider the following code snippet that can be provided to an enginner or candidate:

```
const getAUserProfile = () => {
    const api = 'https://randomuser.me/api/';

    notify(`requesting profile data ...`);
    // make HTTP call with `api`
};
```

If they are required to make a HTTP call to `api` with the `fetch` function in Browsers, then pass the data to a `displayUserPhotoAndName` function after converting it to JSON,
*Gradr* can analyze their code (with ASTs) and tell if they actually did so.

```
const getAUserProfile = () => {
    const api = 'https://randomuser.me/api/';

    notify(`requesting profile data ...`);
    // make HTTP call with `api`

    fetch(api)       
        .then(response => response.json())
        .then(displayUserPhotoAndName)
        .catch(err => console.error(err));
};
```

Though not fully built out right into the tool right now, we believe this helps the enginner or candidate demonstrate (in this scenario) their ability to :
* use the `fetch` function to make API requests
* handle responses and transform them to JSON
* delegate to functions in point-free style
* do basic error handling when making with HTTP calls


In the very near future, *Gradr* will be able to allow anyone visually create *rules* which will get parsed and translated to AST assertion code. This will be more like a WYSIWYG system for code analysis. Right now, we write these AST-checking code by hand. 

This `isArrowFunction` code is an example of hand-written *Gradr* code that knows how to check if a node in the AST is a Javascript arrow function.

```
const isArrowFunction = (node, name, kind='const') =>
  node &&
  node.type === "VariableDeclaration" &&
  node.kind === kind &&
  node.declarations &&
  node.declarations[0].type === "VariableDeclarator" &&
  node.declarations[0].id &&
  node.declarations[0].id.type === "Identifier" &&
  node.declarations[0].id.name === name &&
  node.declarations[0].init &&
  node.declarations[0].init.type === "ArrowFunctionExpression";
```

Work is on-going to move away from this into an X-Path inspired query syntax. 

Taking this further, there's future world where this is all driven by Machine Learning. The examiner will write sample code and the tool's trained Machine Learning models can determine his/her code's *intent*. This can then be matched (with a ton of variations) from the *intent* of the candidate's code, to determine if they are writing the right code and if they wrote it well.

#### Back to Earth!

In the coming months, Gradr will allow aspiring Andela trainee enginners submit a link to the github repo of their ADC (full-stack Bootcamp project called Andela Developer Challenge), and get instant feedback on how they are performing against expectations defined by the project's specification and a few things outside just their code.

#### Got Questions ?

Reach out to @chalu or join the #prefellowship-tech channel, both on Slack.