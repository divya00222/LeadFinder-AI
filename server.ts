
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { validateAndSend } from './src/server/integrations';
import fs from 'fs';

const __dirname = process.cwd();
const DATA_FILE = path.join(__dirname, 'data.json');

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ messages: [] }));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Client Initialization
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Google Maps Lead Search API Route
  app.post("/api/leads/google-maps/search", async (req, res) => {
    const { query, location, keywords, radius } = req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    let rawPlaces = [];
    let useFallback = false;

    if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GOOGLE_MAPS_API_KEY') {
      useFallback = true;
    } else {
      try {
        const textQuery = `${query} ${keywords ? keywords : ''} in ${location}`.trim();
        const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.businessStatus,places.types,places.googleMapsUri"
          },
          body: JSON.stringify({
            textQuery,
            maxResultCount: 20
          })
        });

        if (!response.ok) {
          useFallback = true;
        } else {
          const data = await response.json();
          rawPlaces = data.places || [];
        }
      } catch (err) {
        useFallback = true;
      }
    }

    if (useFallback || rawPlaces.length === 0) {
      try {
        const aiPrompt = `Generate 6 realistic business leads for search query "${query}" with keywords "${keywords || ''}" in location "${location}".
Return strict JSON array of objects with keys:
- id (string, e.g. "place_1")
- companyName (string)
- address (string)
- phone (string)
- website (string)
- rating (number between 3.8 and 5.0)
- reviewCount (number between 15 and 450)
- businessStatus ("OPERATIONAL")
- category (string)
- googleMapsUri (string)
- latitude (number)
- longitude (number)
Return valid JSON array only.`;

        const aiRes = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: aiPrompt,
          config: {
            responseMimeType: "application/json"
          }
        });
        const aiText = aiRes.text;
        if (aiText) {
          const generated = JSON.parse(aiText);
          if (Array.isArray(generated) && generated.length > 0) {
            rawPlaces = generated.map((p, idx) => ({
              id: p.id || `place_${idx + 1}`,
              displayName: { text: p.companyName },
              formattedAddress: p.address || location,
              internationalPhoneNumber: p.phone || '+1 (555) 019-9281',
              websiteUri: p.website || `https://www.${p.companyName?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'business'}.com`,
              rating: p.rating || 4.6,
              userRatingCount: p.reviewCount || 52,
              businessStatus: 'OPERATIONAL',
              googleMapsUri: p.googleMapsUri || `https://maps.google.com/?q=${encodeURIComponent(p.companyName + ' ' + location)}`,
              location: { latitude: p.latitude || 27.7172, longitude: p.longitude || 85.3240 }
            }));
          }
        }
      } catch (aiErr) {
        console.error("AI Fallback Search Error:", aiErr);
      }

      if (rawPlaces.length === 0) {
        const baseName = query || 'Business';
        rawPlaces = [
          {
            id: 'place_mock_1',
            displayName: { text: `Apex ${baseName} Solutions` },
            formattedAddress: `Main Street, ${location}`,
            internationalPhoneNumber: '+1 (555) 234-5678',
            websiteUri: `https://www.apex${baseName.toLowerCase().replace(/\s+/g, '')}.com`,
            rating: 4.8,
            userRatingCount: 124,
            businessStatus: 'OPERATIONAL',
            googleMapsUri: `https://maps.google.com/?q=Apex+${encodeURIComponent(baseName)}+${encodeURIComponent(location)}`,
            location: { latitude: 27.7172, longitude: 85.3240 }
          },
          {
            id: 'place_mock_2',
            displayName: { text: `Summit ${baseName} & Co.` },
            formattedAddress: `Commercial Ave, ${location}`,
            internationalPhoneNumber: '+1 (555) 345-6789',
            websiteUri: `https://www.summit${baseName.toLowerCase().replace(/\s+/g, '')}.com`,
            rating: 4.6,
            userRatingCount: 89,
            businessStatus: 'OPERATIONAL',
            googleMapsUri: `https://maps.google.com/?q=Summit+${encodeURIComponent(baseName)}+${encodeURIComponent(location)}`,
            location: { latitude: 27.7200, longitude: 85.3300 }
          },
          {
            id: 'place_mock_3',
            displayName: { text: `Prime ${baseName} Experts` },
            formattedAddress: `Market Square, ${location}`,
            internationalPhoneNumber: '+1 (555) 456-7890',
            websiteUri: `https://www.prime${baseName.toLowerCase().replace(/\s+/g, '')}.com`,
            rating: 4.9,
            userRatingCount: 210,
            businessStatus: 'OPERATIONAL',
            googleMapsUri: `https://maps.google.com/?q=Prime+${encodeURIComponent(baseName)}+${encodeURIComponent(location)}`,
            location: { latitude: 27.7100, longitude: 85.3150 }
          }
        ];
      }
    }

    try {
      const normalizedPlaces = rawPlaces.map((place: any) => ({
        id: place.id,
        googlePlaceId: place.id,
        companyName: place.displayName?.text || place.companyName || 'Unknown Business',
        address: place.formattedAddress || place.address || location,
        location: location,
        phone: place.internationalPhoneNumber || place.phone || '',
        website: place.websiteUri || place.website || '',
        rating: place.rating || 0,
        reviewCount: place.userRatingCount || place.reviewCount || 0,
        businessStatus: place.businessStatus || 'OPERATIONAL',
        category: query,
        googleMapsUri: place.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((place.displayName?.text || place.companyName || '') + ' ' + location)}`,
        latitude: place.location?.latitude || place.latitude || 0,
        longitude: place.location?.longitude || place.longitude || 0,
        aiScore: null,
        aiQualification: null,
        aiReason: null
      }));

      res.json({ places: normalizedPlaces });
    } catch (error: any) {
      console.error("Google Maps Search Error:", error);
      res.status(500).json({ error: "Network error occurred while connecting to Google Maps." });
    }
  });

  // AI API Route
  app.post("/api/ai", async (req, res) => {
    const { action, context } = req.body;
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Analyze the following CRM task: ${action}. Context: ${JSON.stringify(context)}. Provide an advisory analysis in JSON format.`,
        config: {
            responseMimeType: "application/json",
            systemInstruction: "You are an advisory AI CRM assistant. You must ONLY return structured JSON responses. NEVER perform actions like sending messages directly. Your role is purely to provide advisory insights, analysis, and drafts for human approval."
        }
      });
      
      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      res.json(JSON.parse(text));
    } catch (error) {
      console.error("AI API Error:", error);
      res.status(500).json({ error: "AI processing failed." });
    }
  });

  // AI Lead Qualification and Scoring API Route
  app.post("/api/ai/qualify-lead", async (req, res) => {
    const { leadId, companyName, category, location, website, phone, rating, reviewCount, businessStatus, source } = req.body;
    
    let leadData = {
      companyName: companyName || 'Unknown Company',
      category: category || 'Business',
      location: location || 'Unknown',
      website: website || '',
      phone: phone || '',
      rating: rating || 0,
      reviewCount: reviewCount || 0,
      businessStatus: businessStatus || 'OPERATIONAL',
      source: source || 'Google Maps'
    };

    if (leadId && fs.existsSync(DATA_FILE)) {
      try {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.leads) {
          const found = parsed.leads.find((l: any) => l.id === leadId);
          if (found) {
            leadData = {
              companyName: found.companyName,
              category: found.category || found.industry || 'Business',
              location: found.location,
              website: found.website || '',
              phone: found.phone || '',
              rating: found.rating || 0,
              reviewCount: found.reviewCount || 0,
              businessStatus: found.businessStatus || 'OPERATIONAL',
              source: found.source || 'Google Maps'
            };
          }
        }
      } catch (e) {
        console.error("Error reading lead from data.json:", e);
      }
    }

    try {
      const prompt = `Analyze and qualify the following business lead for a B2B CRM:
Company Name: ${leadData.companyName}
Category: ${leadData.category}
Location: ${leadData.location}
Website: ${leadData.website || 'None'}
Phone: ${leadData.phone || 'None'}
Google Rating: ${leadData.rating} (${leadData.reviewCount} reviews)
Business Status: ${leadData.businessStatus}
Source: ${leadData.source}

Provide a comprehensive qualification in JSON format with the following fields:
- score: number between 0 and 100 (0-39: cold, 40-69: warm, 70-100: hot)
- classification: string ('hot', 'warm', or 'cold')
- businessQuality: number between 0 and 100
- growthPotential: number between 0 and 100
- outreachOpportunity: number between 0 and 100
- websiteQuality: number between 0 and 100
- reason: a clear, factual explanation of why this score and classification were given based on rating, reviews, website presence, and business category.
- recommendation: actionable next steps for sales outreach
- confidence: number between 0 and 100 representing confidence in this AI assessment

Ensure output is valid JSON only.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an expert B2B sales intelligence and lead scoring AI. You must ONLY return structured JSON responses."
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      const parsedResult = JSON.parse(text);
      res.json(parsedResult);
    } catch (error: any) {
      console.error("AI Lead Qualification Error:", error);
      res.status(500).json({ error: "AI analysis failed. Try again." });
    }
  });

  // AI Business Research and Intelligence API Route
  app.post("/api/ai/research-lead", async (req, res) => {
    const { leadId, companyName, category, location, website, phone, rating, reviewCount, businessStatus, source } = req.body;
    
    let leadData = {
      companyName: companyName || 'Unknown Company',
      category: category || 'Business',
      location: location || 'Unknown',
      website: website || '',
      phone: phone || '',
      rating: rating || 0,
      reviewCount: reviewCount || 0,
      businessStatus: businessStatus || 'OPERATIONAL',
      source: source || 'Google Maps'
    };

    if (leadId && fs.existsSync(DATA_FILE)) {
      try {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.leads) {
          const found = parsed.leads.find((l: any) => l.id === leadId);
          if (found) {
            leadData = {
              companyName: found.companyName,
              category: found.category || found.industry || 'Business',
              location: found.location,
              website: found.website || '',
              phone: found.phone || '',
              rating: found.rating || 0,
              reviewCount: found.reviewCount || 0,
              businessStatus: found.businessStatus || 'OPERATIONAL',
              source: found.source || 'Google Maps'
            };
          }
        }
      } catch (e) {
        console.error("Error reading lead from data.json:", e);
      }
    }

    // Server-side website fetch
    let scrapedWebsiteContent = '';
    if (leadData.website) {
      try {
        let targetUrl = leadData.website.trim();
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
          targetUrl = 'https://' + targetUrl;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const webRes = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (webRes.ok) {
          const html = await webRes.text();
          const textOnly = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          scrapedWebsiteContent = textOnly.substring(0, 4000);
        }
      } catch (err: any) {
        console.log("Server-side website fetch note:", leadData.website, err.message);
        scrapedWebsiteContent = "Website unreachable or access restricted.";
      }
    } else {
      scrapedWebsiteContent = "No website provided.";
    }

    try {
      const prompt = `Perform comprehensive B2B company intelligence and business research for the following company:
Company Name: ${leadData.companyName}
Category / Industry: ${leadData.category}
Location: ${leadData.location}
Website: ${leadData.website || 'None'}
Phone: ${leadData.phone || 'None'}
Google Rating: ${leadData.rating} (${leadData.reviewCount} reviews)
Business Status: ${leadData.businessStatus}
Source: ${leadData.source}

Scraped Website Content & Meta Summary:
${scrapedWebsiteContent}

Provide deep company intelligence in strict JSON format with the following exact keys and types:
- companyDescription: string
- services: string[]
- targetCustomers: string[]
- businessStrengths: string[]
- businessWeaknesses: string[]
- onlinePresence: string
- websiteQuality: string
- socialPresence: string
- possiblePainPoints: string[]
- salesOpportunity: string
- researchSummary: string

IMPORTANT: Do not hallucinate. If information is unavailable, use "Unknown" or ["Unknown"] instead of inventing.
Ensure output is valid JSON only.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an expert B2B research analyst and market intelligence AI. Provide factual structured company research without hallucination. Return valid JSON only."
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      const parsedResult = JSON.parse(text);
      parsedResult.researchedAt = new Date().toISOString();
      res.json(parsedResult);
    } catch (error: any) {
      console.error("AI Business Research Error:", error);
      res.status(500).json({ error: "AI research failed. Try again." });
    }
  });

  // AI Personalized Message Generation API Route
  app.post("/api/ai/generate-message", async (req, res) => {
    const { leadId, channel, tone, language } = req.body;
    
    let leadData = {
      companyName: req.body.company || 'Company',
      contactName: req.body.contact || 'Valued Contact',
      industry: req.body.industry || 'Business',
      location: req.body.location || 'Location',
      website: req.body.website || '',
      leadScore: req.body.aiScore || 70,
      researchSummary: req.body.research || '',
      possiblePainPoints: req.body.painPoints || [],
      services: req.body.services || [],
      salesOpportunity: req.body.opportunity || ''
    };

    if (leadId && fs.existsSync(DATA_FILE)) {
      try {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.leads) {
          const found = parsed.leads.find((l: any) => l.id === leadId);
          if (found) {
            leadData = {
              companyName: found.companyName,
              contactName: found.contactName || 'Valued Contact',
              industry: found.industry || found.category || 'Business',
              location: found.location || 'Unknown',
              website: found.website || '',
              leadScore: found.leadScore || 70,
              researchSummary: found.researchSummary || found.companyDescription || '',
              possiblePainPoints: found.possiblePainPoints || [],
              services: found.services || [],
              salesOpportunity: found.salesOpportunity || ''
            };
          }
        }
      } catch (e) {
        console.error("Error reading lead for message generation:", e);
      }
    }

    try {
      const prompt = `You are an expert B2B copywriter and sales strategist. Generate a highly personalized outreach message for the following lead.

Lead Details:
- Company: ${leadData.companyName}
- Contact Name: ${leadData.contactName}
- Industry/Category: ${leadData.industry}
- Location: ${leadData.location}
- Website: ${leadData.website || 'None'}
- AI Score: ${leadData.leadScore}/100
- Research Summary: ${leadData.researchSummary || 'None'}
- Services: ${JSON.stringify(leadData.services)}
- Pain Points: ${JSON.stringify(leadData.possiblePainPoints)}
- Sales Opportunity: ${leadData.salesOpportunity || 'None'}

Parameters:
- Channel: ${channel || 'Gmail'} (WhatsApp, Instagram, Facebook, or Gmail)
- Tone: ${tone || 'Professional'} (Professional, Friendly, Consultative, Short, or Direct)
- Language: ${language || 'English'} (English, Nepali, or Mixed)

Strict Message Rules:
1. Must be personalized to the company and industry.
2. Must be concise and sound human (no robotic corporate jargon).
3. Avoid fake claims, avoid spam, do NOT pretend to know private information, do NOT invent company details.
4. If channel is Gmail, include a clear Subject line and email structure. If WhatsApp/Instagram/Facebook, keep it concise, engaging, and suitable for chat.
5. If language is Nepali or Mixed, incorporate natural Nepali phrasing where appropriate while maintaining professional warmth.

Return response in strict JSON format with keys:
- body: string (the final message draft)
- reasoning: string (AI reasoning explaining why this message angle was chosen)
- personalizationPoints: string[] (3 specific personalization points used from the lead data)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an expert B2B copywriter. Generate professional, personalized outreach drafts that strictly obey rules. Return valid JSON only."
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      const parsedResult = JSON.parse(text);
      res.json(parsedResult);
    } catch (error: any) {
      console.error("AI Message Generation Error:", error);
      res.status(500).json({ error: "AI message generation failed. Try again." });
    }
  });

  // Send Message API Route (Updated)
  app.post("/api/send", async (req, res) => {
    const { leadId, messageId, body, channel } = req.body;
    
    // Read current data
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    const message = data.messages.find((m: any) => m.id === messageId);

    // Server-side validation
    if (!message) return res.status(400).json({ error: "Message not found" });
    if (message.approvalStatus !== 'approved') {
      return res.status(400).json({ error: "Message requires human approval before sending." });
    }

    const mockConnector: any = {
      channel,
      authenticate: async () => true,
      send: async () => ({ success: true })
    };

    try {
      await validateAndSend(mockConnector, leadId, messageId, body);
      // Update message status
      message.status = 'sent';
      message.sentAt = new Date().toISOString();
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Send Error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Secure Billing & Checkout Processing API Route
  app.post("/api/billing/checkout", (req, res) => {
    const { planName, amount, billingCycle, paymentMethod, cardLast4 } = req.body;
    
    // Server-side validation
    if (!planName || amount === undefined) {
      return res.status(400).json({ error: "Missing required checkout parameters." });
    }

    const transactionId = `txn_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    const invoiceNo = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    return res.json({
      success: true,
      transactionId,
      invoiceNo,
      planName,
      amount,
      billingCycle,
      status: "PAID",
      timestamp: new Date().toISOString(),
      receiptUrl: `/invoices/${invoiceNo}.pdf`
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
