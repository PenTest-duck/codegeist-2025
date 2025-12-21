import Resolver from '@forge/resolver';
import { determineResourceType } from './confluenceUtil';
import { retrieveQandas } from './qandaUtil';

const resolver = new Resolver();

resolver.define('retrieveQuestionsAndAnswers', async (request) => {
  console.log(`retrieveQuestionsAndAnswers: req = ${JSON.stringify(request, null, 2)}`);
  const contentId = request.context.extension.content.id;
  const resourceType = await determineResourceType(contentId);
  console.log(`retrieveQuestionsAndAnswers: contentId = ${contentId}`);
  console.log(`retrieveQuestionsAndAnswers: resourceType = ${resourceType}`);
  const qandas = await retrieveQandas(contentId, resourceType);
  return qandas;
});

export const macroHandler = resolver.getDefinitions();
