import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY, dangerouslyAllowBrowser: true });

export const processImages = async (image) => {
  try {
    // Convert the image to base64
    const base64Image = await convertImageToBase64(image);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Extract the following information from this real estate image: address, price, size, features, and contact number. Provide the information in Vietnamese. If any information is not present, omit that field." },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          ],
        },
      ],
      max_tokens: 300,
    });

    const extractedInfo = parseExtractedInfo(response.choices[0].message.content);
    return extractedInfo;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Không thể xử lý hình ảnh');
  }
};

// Helper function to convert image to base64
const convertImageToBase64 = async (image) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(image);
  });
};

// Helper function to parse the extracted information
const parseExtractedInfo = (content) => {
  const info = {};
  const lines = content.split('\n');
  for (const line of lines) {
    const [key, value] = line.split(':').map(s => s.trim());
    if (key && value) {
      info[key.toLowerCase()] = value;
    }
  }
  return info;
};

export const generateSalesPost = async (extractedInfo) => {
  try {
    const prompt = `Tạo một bài đăng bán bất động sản dựa trên thông tin sau:
    Địa chỉ: ${extractedInfo.address}
    Giá: ${extractedInfo.price}
    Diện tích: ${extractedInfo.size}
    Đặc điểm: ${extractedInfo.features}
    Liên hệ: ${extractedInfo.contact}

    Bài đăng nên hấp dẫn, nổi bật các tính năng chính, và bằng tiếng Việt.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating sales post:', error);
    throw new Error('Không thể tạo bài đăng bán hàng');
  }
};

export const mergeImages = async (images) => {
  // Simulating image merging
  // In a real scenario, you'd send the images to a service for merging
  console.log('Merging images:', images.map(img => img.name).join(', '));
  
  // Return a placeholder merged image URL
  return 'https://via.placeholder.com/800x600?text=Merged+Property+Images';
};

export const generateImageCaption = async (extractedInfo) => {
  try {
    const prompt = `Tạo một mô tả ngắn gọn cho bất động sản sau:
    Địa chỉ: ${extractedInfo.address}
    Giá: ${extractedInfo.price}
    Diện tích: ${extractedInfo.size}
    Đặc điểm: ${extractedInfo.features}
    
    Mô tả nên ngắn gọn, hấp dẫn và không quá 20 từ.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating image caption:', error);
    throw new Error('Không thể tạo chú thích cho ảnh');
  }
};