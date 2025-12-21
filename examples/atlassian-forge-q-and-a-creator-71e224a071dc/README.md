# Forge Q&A Creator

[![Atlassian license](https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat-square)](LICENSE)

This is an example [Forge](https://developer.atlassian.com/platform/forge/) app that demonstrates how to leverage Rovo's Atlassian Intelligence capabilities.

## Usage

After installing the app in a Confluence site:

1. Visit a page or blog post.
2. Enter edit mode.
3. Open Atlassian Intelligence by typing /ai.
4. If the *Q&A Agent* isn't visible, select *Browse Agents* and the start icon to make it a favorite. 
5. Select the *Q&A Agent*.
6. Select the conversation starter "Create a list of 3 questions and answers."
7. Wait for the agent to finish creating the list of questions and answers. 
8. When asked whether to insert the A&A macro, enter *Y*.
9. Observe the Q&A macro is added to the end of the page.
10. Pubish the page and try out the Q&A macro.

Alternate flows:

1. Instead of selecting *Y* to insert the Q&A macro, select *N* and click the Atlassian Intelligence *Insert* button to insert the questions and answers into the page being edited. 
2. Try it out from the Chat sidebar.

## Demo

### Initiating the Q&A generation

The following demonstrates initiating the creation of questions and answers. The INVOKE_SKILL message occurs when the AI is calling an agent provided by the app. 

![Insertion of macro](./tutorial/qanda-agent-initiating-creation.gif)

### Presentation of generated Q&A

The following demonstrates the completion of the Q&A generation whereby the AI asks the user whether they want the generated Q&A to be inserted into the editor or alterantively, whether to insert a Q&A macro provided by the app to be inserted.

![Insertion of macro](./tutorial/qanda-agent-final-qanda-creationn.gif)

### Appending the macro

The following demonstrates the user's acceptance of the AI prompt to insert the Q&A Quiz macro into the page. In this case, the AI session is in the chat sidebar.

![Insertion of macro](./tutorial/qanda-agent-insert-macro-demo.gif)

## Installation

1. Follow the instructions on [Example Apps](https://developer.atlassian.com/platform/forge/example-apps/) to copy, deploy, and install this Forge app.
1. Navigate to a Confluence page. 
2. Edit the page.
3. Select the the *Q&A Agent*.
4. Select the conversation starter "Create a list of 3 questions and answers."

## Debugging

You can use the [`forge tunnel`](https://developer.atlassian.com/platform/forge/change-the-frontend-with-forge-ui/#set-up-tunneling) command to run your Forge app locally. 

## License

Copyright (c) 2020 Atlassian and others.
Apache 2.0 licensed, see [LICENSE](LICENSE) file.

[![From Atlassian](https://raw.githubusercontent.com/atlassian-internal/oss-assets/master/banner-cheers.png)](https://www.atlassian.com)
