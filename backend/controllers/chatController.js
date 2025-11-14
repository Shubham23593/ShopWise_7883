import Chat from '../models/Chat.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// AI Response Logic
const generateAIResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.match(/\b(hi|hello|hey|good morning|good evening)\b/)) {
    return {
      message: "Hello! 👋 Welcome to ShopWise! I'm your AI shopping assistant. How can I help you today?",
      quickReplies: [
        "Track my order",
        "Browse products",
        "Check order status",
        "Help me shop",
      ],
    };
  }

  if (lowerMessage.match(/\b(order|track|delivery|shipping|status)\b/)) {
    return {
      message: "I can help you track your order! 📦 Please provide your order ID.",
      type: 'order_inquiry',
      quickReplies: ["Check all my orders", "Contact support"],
    };
  }

  if (lowerMessage.match(/\b(product|item|buy|shop|price|phone|laptop)\b/)) {
    return {
      message: "Looking for products? 🛍️ I can help you find what you need!",
      quickReplies: ["Phones", "Laptops", "Accessories", "View all products"],
    };
  }

  if (lowerMessage.match(/\b(return|refund|cancel|exchange)\b/)) {
    return {
      message: "I understand you want to return or exchange an item. 🔄\n\nOur return policy:\n• 7 days return window\n• Full refund or exchange\n\nWould you like to proceed?",
      quickReplies: ["Yes, start return", "Tell me more", "Check my orders"],
    };
  }

  if (lowerMessage.match(/\b(payment|pay|card|transaction|failed)\b/)) {
    return {
      message: "I'm sorry you're experiencing payment issues. 💳\n\nI can help you check your order and payment status.",
      quickReplies: ["Enter order ID", "Check payment status"],
    };
  }

  if (lowerMessage.match(/\b(discount|coupon|offer|deal|sale)\b/)) {
    return {
      message: "Great choice! 🎉 We have amazing deals!\n\n• Use code: WELCOME10 for 10% off\n• Free shipping on orders above ₹500\n\nWould you like to browse products?",
      quickReplies: ["Browse products", "Apply coupon", "More offers"],
    };
  }

  if (lowerMessage.match(/\b(help|contact|support|agent|human|problem)\b/)) {
    return {
      message: "I'm here to help! 🙋‍♂️\n\nI can assist you with:\n• Order tracking\n• Product information\n• Returns & refunds\n\nHow can I help you?",
      quickReplies: ["Track order", "Browse products", "Check return policy"],
    };
  }

  if (lowerMessage.match(/\b(thank|thanks|appreciate|awesome|great)\b/)) {
    return {
      message: "You're welcome! 😊 Is there anything else I can help you with?",
      quickReplies: ["Yes", "No, that's all", "Browse products"],
    };
  }

  if (lowerMessage.match(/\b(bye|goodbye|see you|exit|close)\b/)) {
    return {
      message: "Thanks for chatting! 👋 Have a great day!",
      quickReplies: ["Start new conversation"],
    };
  }

  return {
    message: "I'm here to help! You can ask me about:\n\n📦 Order tracking\n🛍️ Products\n💳 Payments\n🔄 Returns\n🎁 Offers\n\nWhat would you like to know?",
    quickReplies: ["Track order", "Browse products", "Check offers"],
  };
};

// @desc    Get or create chat session
// @route   POST /api/chat/session
// @access  Private
export const getChatSession = async (req, res) => {
  try {
    console.log('🔍 Creating chat session for user:', req.user.id);

    const userId = req.user.id;
    const { sessionId } = req.body;

    let chat;

    // Try to find existing session
    if (sessionId) {
      console.log('🔍 Looking for existing session:', sessionId);
      chat = await Chat.findOne({ sessionId, userId });
      
      if (chat) {
        console.log('✅ Found existing chat session');
        return res.json({
          success: true,
          data: chat,
        });
      }
    }

    // Create new session
    const newSessionId = `${userId}_${Date.now()}`;
    console.log('✨ Creating new chat session:', newSessionId);

    chat = await Chat.create({
      userId,
      sessionId: newSessionId,
      messages: [
        {
          sender: 'bot',
          message: "Hi there! 👋 I'm your ShopWise assistant. How can I help you today?",
          timestamp: new Date(),
          metadata: {
            quickReplies: ["Track order", "Browse products", "Check offers", "Need help"],
          },
        },
      ],
      status: 'active',
    });

    console.log('✅ Chat session created successfully');

    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error('❌ Error in getChatSession:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create chat session',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// @desc    Send message
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    console.log('📨 Sending message in session:', sessionId);

    const chat = await Chat.findOne({ sessionId, userId: req.user.id });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found',
      });
    }

    // Add user message
    chat.messages.push({
      sender: 'user',
      message,
      timestamp: new Date(),
    });

    // Generate AI response
    const aiResponse = generateAIResponse(message);

    // Add bot response
    chat.messages.push({
      sender: 'bot',
      message: aiResponse.message,
      timestamp: new Date(),
      metadata: {
        type: aiResponse.type || 'text',
        quickReplies: aiResponse.quickReplies,
      },
    });

    await chat.save();

    console.log('✅ Message sent successfully');

    res.json({
      success: true,
      data: {
        userMessage: chat.messages[chat.messages.length - 2],
        botMessage: chat.messages[chat.messages.length - 1],
      },
    });
  } catch (error) {
    console.error('❌ Error in sendMessage:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get order status
// @route   POST /api/chat/order-status
// @access  Private
export const getOrderStatus = async (req, res) => {
  try {
    const { orderId, sessionId } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user.id,
    }).populate('items.productId');

    if (!order) {
      return res.json({
        success: true,
        data: {
          message: "I couldn't find an order with that ID. Please check and try again.",
          quickReplies: ["Show all orders", "Try again"],
        },
      });
    }

    const statusEmoji = {
      pending: '⏳',
      processing: '📦',
      shipped: '🚚',
      delivered: '✅',
      cancelled: '❌',
    };

    const response = {
      message: `${statusEmoji[order.status]} Order Status: ${order.status.toUpperCase()}\n\nOrder ID: #${order._id.toString().slice(-8)}\nTotal: ₹${order.totalPrice.toLocaleString('en-IN')}\nItems: ${order.items.length}\n\nWould you like more details?`,
      metadata: {
        type: 'order',
        orderId: order._id,
      },
      quickReplies: ['Show items', 'Track shipment'],
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('❌ Error in getOrderStatus:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get product recommendations
// @route   POST /api/chat/recommend
// @access  Private
export const getProductRecommendations = async (req, res) => {
  try {
    const { query } = req.body;

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
      ],
    }).limit(5);

    let message;
    if (products.length === 0) {
      message = `I couldn't find any products matching "${query}". 😕\n\nWould you like to browse all products?`;
    } else {
      message = `I found ${products.length} product(s) for "${query}"! 🛍️`;
    }

    res.json({
      success: true,
      data: {
        message,
        products,
      },
    });
  } catch (error) {
    console.error('❌ Error in getProductRecommendations:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/history
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id })
      .sort('-createdAt')
      .limit(10);

    res.json({
      success: true,
      count: chats.length,
      data: chats,
    });
  } catch (error) {
    console.error('❌ Error in getChatHistory:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Close chat session
// @route   PUT /api/chat/close/:sessionId
// @access  Private
export const closeChat = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const chat = await Chat.findOne({ sessionId, userId: req.user.id });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found',
      });
    }

    chat.status = 'closed';
    await chat.save();

    res.json({
      success: true,
      message: 'Chat closed successfully',
    });
  } catch (error) {
    console.error('❌ Error in closeChat:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};