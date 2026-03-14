import db from '../config/db.js';

// Get all FAQs with category information
export const getAllFAQs = async (req, res) => {
  try {
    const query = `
      SELECT f.id, f.question, f.answer, f.faqsCategID, c.faqsCategory as categoryName
      FROM faqs f
      LEFT JOIN faqs_categ_tbl c ON f.faqsCategID = c.faqsCategID
      ORDER BY f.faqsCategID, f.id
    `;
    const [rows] = await db.execute(query);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQs', error: error.message });
  }
};

// Get all FAQs by category ID with category information
export const getFAQsByCategory = async (req, res) => {
  try {
    const query = `
      SELECT f.id, f.question, f.answer, f.faqsCategID, c.faqsCategory as categoryName
      FROM faqs f
      LEFT JOIN faqs_categ_tbl c ON f.faqsCategID = c.faqsCategID
      WHERE f.faqsCategID = ?
      ORDER BY f.id
    `;
    const [rows] = await db.execute(query, [req.params.categoryId]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQs', error: error.message });
  }
};

// Get FAQ by ID
export const getFAQById = async (req, res) => {
  try {
    const query = `
      SELECT f.id, f.question, f.answer, f.embedding, f.faqsCategID, c.faqsCategory as categoryName
      FROM faqs f
      LEFT JOIN faqs_categ_tbl c ON f.faqsCategID = c.faqsCategID
      WHERE f.id = ?
    `;
    const [rows] = await db.execute(query, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQ', error: error.message });
  }
};

// Get FAQ category by ID
export const getFAQCategoryById = async (req, res) => {
  try {
    const query = `
      SELECT faqsCategID as id, faqsCategory as categoryName
      FROM faqs_categ_tbl
      WHERE faqsCategID = ?
    `;
    const [rows] = await db.execute(query, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'FAQ category not found' });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQ category', error: error.message });
  }
};

// Get all FAQ categories
export const getAllFAQCategories = async (req, res) => {
  try {
    const query = `
      SELECT faqsCategID as id, faqsCategory as categoryName
      FROM faqs_categ_tbl
      ORDER BY faqsCategID
    `;
    const [rows] = await db.execute(query);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQ categories', error: error.message });
  }
};
