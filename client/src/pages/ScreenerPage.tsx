import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

export default function ScreenerPage() {
  return <MainLayout><div className="p-6 text-white"><h1>Screener</h1></div></MainLayout>;
}
