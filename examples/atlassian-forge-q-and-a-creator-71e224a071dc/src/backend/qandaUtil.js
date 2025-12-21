import { updateContentProperty, createContentProperty, getContentProperties, resourceTypeToContentType } from './confluenceUtil';

const propertKeyPrefix = 'qanda-';

export const storeQanda = async (contentId, resourceType, question, answer) => {
  const contentType = resourceTypeToContentType(resourceType);
  if (resourceType === 'page' || resourceType === 'blog') {
    const key = propertyKeyFromQuestion(question);
    const value = propertyValueFromQandA(question, answer);
    const contentProperties = await getContentProperties(contentId, contentType);
    // console.log(`storeQandA: contentProperties = ${JSON.stringify(contentProperties, null, 2)}`);
    const existingContentProperty = await findContentPropertyByQuestion(question, contentProperties);
    if (existingContentProperty) {
      // Just in case the answer has changed...
      await updateContentProperty(contentId, contentType, existingContentProperty.id, key, value, existingContentProperty.version.number + 1);
    } else {
      await createContentProperty(contentId, contentType, key, value);
    }
  } else {
    console.error(`storeQandA: Unsupported resourceType: ${resourceType}`);
  }
}

export const retrieveQandas = async (contentId, resourceType) => {
  const contentType = resourceTypeToContentType(resourceType);
  const contentProperties = await getContentProperties(contentId, contentType);
  // console.log(`retrieveQandas: contentProperties = ${JSON.stringify(contentProperties, null, 2)}`);
  const qandas = [];
  for (const contentProperty of contentProperties) {
    if (contentProperty.key.startsWith(propertKeyPrefix)) {
      const value = JSON.parse(contentProperty.value);
      qandas.push({
        question: value.question,
        answer: value.answer
      });
    }
  }
  return qandas;
}

const findContentPropertyByQuestion = (question, contentProperties) => {
  for (const contentProperty of contentProperties) {
    if (contentProperty.key.startsWith(propertKeyPrefix)) {
      const value = JSON.parse(contentProperty.value);
      if (value.question === question) {
        return contentProperty
      }
    }
  }
  return undefined;
}

const propertyKeyFromQuestion = (question) => {
  return `${propertKeyPrefix}${hashString(question)}`;
}

const propertyValueFromQandA = (question, answer) => {
  return JSON.stringify({
    question: question,
    answer: answer
  });
}

const hashString = (text) => {
  var hash = 0,
    i, chr;
  if (text.length === 0) return hash;
  for (i = 0; i < text.length; i++) {
    chr = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
