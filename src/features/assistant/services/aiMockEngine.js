/**
 * In a production environment, this file would construct a prompt string
 * containing the user's JSON data and send it to an OpenAI/Gemini endpoint.
 * Here, we simulate that context-aware natural language processing.
 */
import { formatCurrency } from '../../../utils/currency';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function simulateAIResponse(query, transactions = []) {
  await delay(1500); // Simulate network latency & token generation
  
  const lowerQuery = query.toLowerCase();

  // "RAG" Simulation (Retrieving data based on query intent)
  if (lowerQuery.includes('food') || lowerQuery.includes('eat')) {
    const foodTotal = transactions
      .filter(tx => tx.category === 'Food & Dining')
      .reduce((sum, tx) => sum + Math.abs(Number(tx.amount) || 0), 0);
    return `Based on your transactions, you have spent **${formatCurrency(foodTotal)}** on food recently. Want me to suggest a budget limit for dining out?`;
  }

  if (lowerQuery.includes('highest') || lowerQuery.includes('most')) {
    const expenses = transactions.filter(tx => tx.type === 'expense');
    if (!expenses.length) return "I don't see any expenses on your record yet.";
    
    const highest = expenses.reduce((prev, current) => 
      Math.abs(Number(current.amount) || 0) > Math.abs(Number(prev.amount) || 0) ? current : prev
    );
    return `Your highest recent expense was **${formatCurrency(Math.abs(Number(highest.amount) || 0))}** at **${highest.description}** on ${highest.date}.`;
  }

  if (lowerQuery.includes('save') || lowerQuery.includes('saving')) {
    return "To increase your savings rate, I recommend looking at your 'Software' subscriptions. You have recurring charges there that might be unused.";
  }

  // Fallback response
  return `I'm analyzing your data. I can currently see ${transactions.length} transactions across your wallets. Try asking me about your highest expenses or food spending!`;
}