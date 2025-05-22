import { Request, Response } from 'express';
import Partner from '../models/Partner.js';
import EscrowTransaction from '../models/EscrowTransaction.js';

interface CreatePartnerRequest {
  name: string;
  email: string;
  companyName: string;
}

// Create new partner
export const createPartner = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, companyName } = req.body as CreatePartnerRequest;

    // Validate required fields
    if (!name || !email || !companyName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, companyName'
      });
    }

    // Check if partner already exists
    const existingPartner = await Partner.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({
        success: false,
        error: 'Partner with this email already exists'
      });
    }

    // Create new partner (secret token will be auto-generated)
    const partner = new Partner({
      name,
      email,
      companyName
    });

    await partner.save();

    return res.status(201).json({
      success: true,
      data: {
        partner: {
          id: partner._id,
          name: partner.name,
          email: partner.email,
          companyName: partner.companyName,
          secretToken: partner.secretToken,
          isActive: partner.isActive,
          createdAt: partner.createdAt
        }
      },
      message: 'Partner created successfully'
    });
  } catch (error) {
    console.error('Error creating partner:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create partner'
    });
  }
};

// Get all partners
export const getAllPartners = async (req: Request, res: Response): Promise<Response> => {
  try {
    const partners = await Partner.find().select('-secretToken').sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: { partners }
    });
  } catch (error) {
    console.error('Error getting partners:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve partners'
    });
  }
};

// Get partner details with secret token (admin only)
export const getPartnerDetails = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { partnerId } = req.params;

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partner not found'
      });
    }

    // Get partner statistics
    const stats = await EscrowTransaction.aggregate([
      { $match: { sellerId: partner._id.toString() } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const summary = {
      totalTransactions: 0,
      totalAmount: 0,
      byStatus: {} as any
    };

    stats.forEach(stat => {
      summary.totalTransactions += stat.count;
      summary.totalAmount += stat.totalAmount;
      summary.byStatus[stat._id] = {
        count: stat.count,
        amount: stat.totalAmount
      };
    });

    return res.json({
      success: true,
      data: {
        partner: {
          id: partner._id,
          name: partner.name,
          email: partner.email,
          companyName: partner.companyName,
          secretToken: partner.secretToken,
          isActive: partner.isActive,
          createdAt: partner.createdAt,
          lastUsed: partner.lastUsed
        },
        stats: summary
      }
    });
  } catch (error) {
    console.error('Error getting partner details:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve partner details'
    });
  }
};

// Regenerate partner secret token
export const regeneratePartnerToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { partnerId } = req.params;

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partner not found'
      });
    }

    // Generate new secret token
    const newToken = await partner.generateSecretToken();
    await partner.save();

    return res.json({
      success: true,
      data: {
        partnerId: partner._id,
        newSecretToken: newToken
      },
      message: 'Secret token regenerated successfully'
    });
  } catch (error) {
    console.error('Error regenerating partner token:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to regenerate token'
    });
  }
};

// Toggle partner active status
export const togglePartnerStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { partnerId } = req.params;

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partner not found'
      });
    }

    partner.isActive = !partner.isActive;
    await partner.save();

    return res.json({
      success: true,
      data: {
        partnerId: partner._id,
        isActive: partner.isActive
      },
      message: `Partner ${partner.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling partner status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update partner status'
    });
  }
};

// Delete partner
export const deletePartner = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { partnerId } = req.params;

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partner not found'
      });
    }

    // Check if partner has any transactions
    const transactionCount = await EscrowTransaction.countDocuments({
      sellerId: partner._id.toString()
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete partner with existing transactions. Deactivate instead.'
      });
    }

    await Partner.findByIdAndDelete(partnerId);

    return res.json({
      success: true,
      message: 'Partner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete partner'
    });
  }
};
