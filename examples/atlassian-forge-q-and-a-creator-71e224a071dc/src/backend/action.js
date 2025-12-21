import { getAppContext } from "@forge/api";
import { fetchPageOrBlogInfo, resourceTypeToContentType, updatePageOrBlogContent } from './confluenceUtil';
import { storeQanda } from './qandaUtil';

// This routine is a Rovo action that will fetch the content of the page or blog post that the AI is 
// running against.
export const fetchContent = async (payload) => {
  console.log(`fetchContent: payload = ${JSON.stringify(payload, null, 2)}`);
  // If the user has highlighted some text, then simply return it...
  if (payload.highlightedText) {
    return payload.highlightedText;
  }
  const contentId = payload.contentId;
  const resourceType = payload.context.confluence.resourceType;
  const contentType = resourceTypeToContentType(resourceType);
  const pageInfo = await fetchPageOrBlogInfo(contentId, contentType, 'view');
  return pageInfo.content;
}

export const registerQandA = async (payload) => {
  console.log(`registerQandA. payload = ${JSON.stringify(payload, null, 2)}`);
  const question = sanitise(payload.question);
  const answer = sanitise(payload.answer);
  const qAndAResult = {
    question: question,
    answer: answer,
    score: Math.round(Math.random() * 100.0),
  };
  const resourceType = payload.context.confluence.resourceType;
  await storeQanda(payload.contentId, resourceType, question, answer);
  return JSON.stringify(qAndAResult);
}

export const insertQandAMacro = async (payload) => {
  console.log(`insertQandAMacro. payload = ${JSON.stringify(payload, null, 2)}`);
  const contentId = payload.contentId;
  const resourceType = payload.context.confluence.resourceType;
  const contentType = resourceTypeToContentType(resourceType);
  const pageInfo = await fetchPageOrBlogInfo(contentId, contentType, 'atlas_doc_format');
  const adfText = pageInfo.content;
  const adf = JSON.parse(adfText);
  adf.content.push(buildMacro());
  const version = 1; // (current draft)
  await updatePageOrBlogContent(contentId, contentType, 'atlas_doc_format', pageInfo.title, version, adf);
}

const buildMacro = () => {
  const { appAri, environmentAri, environmentType } = getAppContext();
  // Note, the moduleKey to use is not the current module available from getAppContext(), but 
  // that of the macro to insert.
  const moduleKey = 'qanda-macro';
  const appId = appAri.appId;
  const environmentTypeLower = environmentType.toLowerCase();
  const environmentSuffix = environmentTypeLower === 'production' ? '' : ` (${environmentTypeLower})`;
  const title = `Q&A Quiz${environmentSuffix}`;
  const environmentAriParts = environmentAri.toString().split('/');
  const environmentId = environmentAriParts[2];
  const localId = ''; // this can be empty
  const extensionKey = `${appId}/${environmentId}/static/${moduleKey}`;
  const extensionId = `ari:cloud:ecosystem::extension/${appId}/${environmentId}/static/${moduleKey}`;
  const macro = {
    type: "extension",
    attrs: {
      layout: "default",
      extensionType: "com.atlassian.ecosystem",
      extensionKey: extensionKey,
      text: title,
      parameters: {
        localId: localId,
        extensionId: extensionId,
        extensionTitle: title
      },
      localId: localId
    }
  }
  return macro;
}

const sanitise = (text) => {
  return text;
}
