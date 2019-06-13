# [Gradr](https://alc-dev-toolkit-d50fe.firebaseapp.com)

*Gradr* provides evaluation and auto-grading of simple *Javascript, and soon, Node/Express* web projects by leveraging [ASTs](https://www.youtube.com/watch?v=CFQBHy8RCpg) for static [code analysis](https://www.youtube.com/results?search_query=esprima+static+code+analysis).

This is based on the belief that checking the output of code during engineer evaluation is very insufficient. *Gradr* is attempting to take it further by using ASTs to statically evaluate code to determine if it was written according to specification. AST code evaluation is currently only support for Javascript. HTML and CSS support will be shipping soon.

For an exploration of why Gradr started and how far it has come, as well as a quick demo, [go here](https://docs.google.com/presentation/d/1YEyIOYPKyhJdyXigReL-D80oUAFL5Us7tfq6Tx68RpY)

## How Does It Work?

Consider the following code snippet that can be provided to an engineer during an evaluation process or who needs to level-up:

```
const getAUserProfile = () => {
    const api = 'https://randomuser.me/api/';

    notify(`requesting profile data ...`);
    // make HTTP call with `api`
};
```

If they are required to make a HTTP call to `api` with the `fetch` function in Browsers, then pass the data to a `displayUserPhotoAndName` function after converting it to JSON, like so :

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

*Gradr* can analyse the Javascript code with ASTs and tell if they actually did so.

Though not explicitly built right now, we believe this helps the engineer demonstrate (in this scenario) their ability to :
* use the `fetch` function to make API requests
* handle responses and transform them to JSON
* delegate to functions in point-free style
* do basic error handling when making with HTTP calls

Right now, AST audits are fully written by hand, and recent improvements have led to the adoption of XPath for AST querying instead of using long and very brittle conditional statements that manually inspect the shape of ASTs.

The following functions can determine if an AST has a given arrow function:

```
const queryExpressionDeclaration = ({ kind = 'const', name, exprType }) => {
  const query = `
    //VariableDeclaration [
      @kind == '${kind}' &&
      /:declarations VariableDeclarator [
        /:id Identifier [@name == '${name}'] 
        && /:init ${exprType}
      ]
    ]
  `;
  return query;
};

const queryArrowFunction = ({ kind = 'const', name }) => {
  return queryExpressionDeclaration({
    kind,
    name,
    exprType: 'ArrowFunctionExpression'
  });
};
```

Which can then be used during AST audit time as :

```
const displaySelectedUserFn = createAudit(queryArrowFunction, {
        name: 'displaySelectedUser'
});
```

Taking this further, there's future where this is all driven by Machine Learning. 
A pool of engineers write sample labeled code used to train and re-train a machine learning classification model. These models are then used to determine the intents of a candidates code to see if they have coverage for the competencies required for the given assessment.

## Back to Earth!

### Want to see things for yourself

Take a [sample test here](https://alc-dev-toolkit-d50fe.firebaseapp.com/jqe3zYO8xTfiuCLDEEgu)

To install locally, take a look at the code and try things out in a developer-like fashion

* install `yarn` and `parceljs`
* clone this repo
* run `yarn install`
* then run `yarn develop-playgrpund`
* finally, open `localhost:1234/jqe3zYO8xTfiuCLDEEgu` in a chrome browser


### Looking ahead!

In the coming months, Gradr will allow aspiring Andela engineers 
* build a mini-app as demonstration they possess `basic programming skills` and get a fully automated feedback scorecard
* submit a github repo of their ADC (full-stack JS/Node/Express web app) as demonstration of `beginner level competence` as an engineer, giving them timely automated and augmented feedback based on a partially automated scorecard
* complete a combination of min-apps or ADCs, while receiving timely feedback, as demonstration of competence in a given learning journey.

## Got Questions ?

Reach out to @chalu or join the #ted-tech channel, both on Slack.