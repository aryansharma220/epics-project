import type { NextApiRequest, NextApiResponse } from 'next';
import { CropData } from '../../types/dashboard';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      // Here you would typically save to your database
      // For now, we'll just return the data
      const data = req.body as CropData;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Failed to save crop data' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
