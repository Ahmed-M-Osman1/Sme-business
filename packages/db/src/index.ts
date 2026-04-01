export {db} from './client';

export {quoteStatusEnum, quotes} from './schema/quotes';
export type {Quote, NewQuote} from './schema/quotes';

export {quoteResults} from './schema/quote-results';
export type {QuoteResult, NewQuoteResult} from './schema/quote-results';

export {policyStatusEnum, policies} from './schema/policies';
export type {Policy, NewPolicy} from './schema/policies';

export {documents} from './schema/documents';
export type {Document, NewDocument} from './schema/documents';

export {aiRecommendations} from './schema/ai-recommendations';
export type {AiRecommendation, NewAiRecommendation} from './schema/ai-recommendations';

export {adminRoleEnum, adminUsers} from './schema/admin-users';
export type {AdminUser, NewAdminUser} from './schema/admin-users';
