import { Router } from 'express';
import { syncJsePrices } from '../services/priceSync';
const router = Router();

router.get('/prices', async (req, res) => {
  const result = await syncJsePrices();
  res.json(result);
});

export default router;
