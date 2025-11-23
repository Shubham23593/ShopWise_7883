import ChatSession from '../models/ChatSession.js';
import { generateChatResponse, generateProductRecommendations } from '../config/gemini.js';
import Product from '../models/Product.js';
import { v4 as uuidv4 } from 'uuid';

// @desc    Create new chat session
// @route   POST /api/chat/session
// @access  Public
export const createChatSession = async (req, res) => {
  try {
    const sessionId = uuidv4();
    const userId = req.user?._id || null;

    const session = await ChatSession.create({
      sessionId,
      userId,
      messages: [],
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        message: 'Chat session created',
      },
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Send message and get AI response
// @route   POST /api/chat/message
// @access  Public
export const sendMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and message are required',
      });
    }

    // Find or create session
    let session = await ChatSession.findOne({ sessionId });
    
    if (!session) {
      const userId = req.user?._id || null;
      session = await ChatSession.create({
        sessionId,
        userId,
        messages: [],
      });
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Build conversation history for Gemini
    const conversationHistory = session.messages.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Check if user is asking for product recommendations
    const isProductQuery = /recommend|suggest|find|looking for|need|want|buy|show me/i.test(message);
    
    let aiResponse;
    
    if (isProductQuery) {
      // Get products for recommendations
      const products = await Product.find().limit(20);
      const recResponse = await generateProductRecommendations(message, products);
      aiResponse = recResponse.recommendations || recResponse.message;
    } else {
      // General chat response
      const response = await generateChatResponse(message, conversationHistory);
      aiResponse = response.message;
    }

    // Add AI response
    session.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });

    await session.save();

    res.json({
      success: true,
      data: {
        response: aiResponse,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message,
    });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/history/:sessionId
// @access  Public
export const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.json({
      success: true,
      data: session.messages,
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Close chat session
// @route   PUT /api/chat/close/:sessionId
// @access  Public
export const closeChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    session.isActive = false;
    await session.save();

    res.json({
      success: true,
      message: 'Chat session closed',
    });
  } catch (error) {
    console.error('Close session error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's chat sessions (for logged in users)
// @route   GET /api/chat/my-sessions
// @access  Private
export const getMySessions = async (req, res) => {
  try {
    const userId = req.user._id;

    const sessions = await ChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};