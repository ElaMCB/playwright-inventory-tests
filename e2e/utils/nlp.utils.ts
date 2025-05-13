import natural from 'natural';
import nlp from 'compromise';

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();

export class NLPUtils {
    /**
     * Extract key phrases from text
     */
    static extractKeyPhrases(text: string): string[] {
        const doc = nlp(text);
        return doc.topics().out('array');
    }

    /**
     * Calculate similarity between two texts
     */
    static calculateSimilarity(text1: string, text2: string): number {
        const tokens1 = tokenizer.tokenize(text1.toLowerCase());
        const tokens2 = tokenizer.tokenize(text2.toLowerCase());
        
        if (!tokens1 || !tokens2) return 0;
        
        const set1 = new Set(tokens1);
        const set2 = new Set(tokens2);
        
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return intersection.size / union.size;
    }

    /**
     * Extract entities from text
     */
    static extractEntities(text: string): { type: string; text: string }[] {
        const doc = nlp(text);
        const entities = [];
        
        // Extract organizations
        const orgs = doc.organizations().out('array');
        orgs.forEach(org => entities.push({ type: 'organization', text: org }));
        
        // Extract dates
        const dates = doc.dates().out('array');
        dates.forEach(date => entities.push({ type: 'date', text: date }));
        
        // Extract numbers
        const numbers = doc.numbers().out('array');
        numbers.forEach(num => entities.push({ type: 'number', text: num }));
        
        return entities;
    }

    /**
     * Analyze sentiment of text
     */
    static analyzeSentiment(text: string): { score: number; comparative: number } {
        const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
        const tokens = tokenizer.tokenize(text);
        
        if (!tokens) return { score: 0, comparative: 0 };
        
        const score = analyzer.getSentiment(tokens);
        return {
            score,
            comparative: score / tokens.length
        };
    }

    /**
     * Extract keywords from text using TF-IDF
     */
    static extractKeywords(text: string, numKeywords: number = 5): string[] {
        tfidf.addDocument(text);
        const keywords = new Set<string>();
        
        tfidf.listTerms(0).forEach(item => {
            if (keywords.size < numKeywords) {
                keywords.add(item.term);
            }
        });
        
        return Array.from(keywords);
    }

    /**
     * Verify if text contains specific keywords
     */
    static containsKeywords(text: string, keywords: string[]): boolean {
        const textTokens = new Set(tokenizer.tokenize(text.toLowerCase()));
        return keywords.some(keyword => 
            textTokens.has(keyword.toLowerCase())
        );
    }

    /**
     * Extract dates from text
     */
    static extractDates(text: string): string[] {
        const doc = nlp(text);
        return doc.dates().out('array');
    }

    /**
     * Extract numbers from text
     */
    static extractNumbers(text: string): number[] {
        const doc = nlp(text);
        return doc.numbers().out('array').map(Number);
    }
} 