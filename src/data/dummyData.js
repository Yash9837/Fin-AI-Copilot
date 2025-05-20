export const conversations = [
  {
    id: 1,
    user: { name: 'Sarah', source: 'Insurance', email: 'sarah.insurance@example.com', orderId: 'CLAIM5487' },
    snippet: 'I expected 80% reimbursement...',
    timeAgo: '13m',
    unread: true,
    avatar: 'S'
  },
  {
    id: 2,
    user: { name: 'Ivan', source: 'Nike', email: 'ivan.nike@example.com', orderId: 'ORD12346' },
    snippet: 'Hi there, I have a qu...',
    timeAgo: '10m',
    unread: true,
    avatar: 'I',
    priority: true
  },
  // Add more conversations to reach 12 open tickets
  {
    id: 3,
    user: { name: 'Lead from New York', source: '', email: 'lead.ny@example.com', orderId: 'ORD12347' },
    snippet: 'Good morning, let me...',
    timeAgo: '15m',
    unread: true,
    avatar: 'L'
  },
  {
    id: 4,
    user: { name: 'Booking API problems', source: '', email: 'support@example.com', orderId: 'ORD12348' },
    snippet: 'Bug report',
    timeAgo: '20m',
    unread: true,
    secondLine: 'Luis · Small Crafting',
    isSystem: true
  },
  {
    id: 5,
    user: { name: 'Miracle', source: 'Exemplary Bank', email: 'miracle.bank@example.com', orderId: 'ORD12349' },
    snippet: 'Hey there, I\'m here to...',
    timeAgo: '25m',
    unread: true,
    avatar: 'M'
  },
  {
    id: 6,
    user: { name: 'Alex', source: 'Retail', email: 'alex.retail@example.com', orderId: 'ORD12350' },
    snippet: 'Can you help with my order?',
    timeAgo: '30m',
    unread: true,
    avatar: 'A'
  },
  {
    id: 7,
    user: { name: 'Emma', source: 'Tech Support', email: 'emma.tech@example.com', orderId: 'ORD12351' },
    snippet: 'I have an issue with...',
    timeAgo: '35m',
    unread: true,
    avatar: 'E'
  },
  {
    id: 8,
    user: { name: 'Noah', source: 'Finance', email: 'noah.finance@example.com', orderId: 'ORD12352' },
    snippet: 'Payment issue...',
    timeAgo: '40m',
    unread: true,
    avatar: 'N'
  },
  {
    id: 9,
    user: { name: 'Olivia', source: 'Travel', email: 'olivia.travel@example.com', orderId: 'ORD12353' },
    snippet: 'Booking confirmation...',
    timeAgo: '45m',
    unread: true,
    avatar: 'O'
  },
  {
    id: 10,
    user: { name: 'Liam', source: 'Healthcare', email: 'liam.health@example.com', orderId: 'ORD12354' },
    snippet: 'Appointment issue...',
    timeAgo: '50m',
    unread: true,
    avatar: 'L'
  },
  {
    id: 11,
    user: { name: 'Ava', source: 'Retail', email: 'ava.retail@example.com', orderId: 'ORD12355' },
    snippet: 'Return request...',
    timeAgo: '55m',
    unread: true,
    avatar: 'A'
  },
  {
    id: 12,
    user: { name: 'James', source: 'Support', email: 'james.support@example.com', orderId: 'ORD12356' },
    snippet: 'Technical issue...',
    timeAgo: '60m',
    unread: true,
    avatar: 'J'
  }
];

// Simulated public help content (knowledge base)
export const knowledgeBase = {
  refunds: 'Our refund policy allows returns within 60 days of purchase. Please provide your order ID and proof of purchase to initiate a refund. Items must be un-opened and in original condition.\n\n**Return Process:**\n1. Contact support with your order ID.\n2. Receive a QR code for return.\n3. Ship the item back.\n4. Automatic refund will be processed upon receipt.',
  shipping: 'Shipping typically takes 5-7 business days. You can track your order using the tracking number provided in your confirmation email.',
  returns: 'To return an item, please contact support with your order ID. Returns are accepted within 60 days of purchase.',
  insurance: 'Insurance reimbursements are calculated at 80% of the billed amount, subject to policy terms. For discrepancies, please provide your claim ID and bill details.\n\n**Note:** Ensure all documentation is submitted within 30 days of the claim.'
};

// Initial conversation (insurance claim scenario)
export const initialConversation = {
  id: 1,
  user: { name: 'Sarah Johnson', source: 'Insurance', email: 'sarah.insurance@example.com', orderId: 'CLAIM5487' },
  messages: [
    {
      id: 1,
      content: 'I expected an 80% reimbursement on my $2,500 hospital bill, which should be $2,000, but I only received $1,600. Can you look into this discrepancy for me?',
      sender: 'user',
      timestamp: '13m',
      status: 'delivered'
    },
    {
      id: 2,
      content: 'Operator assigned this conversation to USA · 13m',
      sender: 'system',
      timestamp: '13m',
      status: 'delivered'
    },
    {
      id: 3,
      content: 'I’m investigating the calculation issue for claim ID #5487. This might be complex—would you like to schedule a video call to resolve this more efficiently?',
      sender: 'agent',
      timestamp: '12m',
      status: 'seen'
    }
  ]
};