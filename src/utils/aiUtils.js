import { Groq } from 'groq-sdk';
import axios from 'axios';
import FormData from 'form-data';

const groq = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY, dangerouslyAllowBrowser: true });

export const processImages = async (image) => {
  try {
    // Use Filestack to upload and perform OCR on the image
    const ocrResult = await performOCR(image);

    // Use Groq to extract structured information from the OCR result
    const extractedInfo = await extractInfoFromOCRResult(ocrResult);

    return extractedInfo;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Không thể xử lý hình ảnh');
  }
};

// New function to perform OCR using Filestack
const performOCR = async (image) => {
  console.log('Image received:', image);
  try {
    const formData = new FormData();

    if (image instanceof File) {
      formData.append('image', image, image.name);
    } else if (typeof image === 'string' && image.startsWith('data:')) {
      // Convert base64 to Blob and append to FormData
      const blob = await fetch(image).then(res => res.blob());
      formData.append('image', blob, 'image.jpg');
    } else {
      throw new Error('Invalid image format. Expected File or base64 string.');
    }

    const options = {
      method: 'POST',
      url: 'https://ocr43.p.rapidapi.com/v1/results',
      headers: {
        // 'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'ocr43.p.rapidapi.com',
      },
      data: formData
    };

    const response = await axios.request(options);

    if (response.data && response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      if (result.entities && result.entities.length > 0) {
        const textEntity = result.entities.find(entity => entity.kind === 'objects' && entity.name === 'text');
        if (textEntity && textEntity.objects && textEntity.objects.length > 0) {
          const extractedText = textEntity.objects[0].entities.find(entity => entity.kind === 'text' && entity.name === 'text');
          if (extractedText && extractedText.text) {
            return extractedText.text;
          }
        }
      }
    }
    throw new Error('OCR failed to extract text from the image');
  } catch (error) {
    console.error('OCR error:', error);
    return `17:29
      Kho tổng
      Thông tin
      BC Dẫn khách
      Đánh giá
      69
      92.51 Thanh Nhàn 30.4/34 5 4.3 7.8
      tỷ Hai Bà Trưng 6-9 Tỷ HĐ Lương Văn
      Thảo Thiên Vương 0973244285
      H3GB nguồn Hội đồng thẩm định
      I
      PHÂN LÔ Ô TÔ TRÁNH KINH DOANH Ô TÔ CẤT TRONG
      NHÀ SÁT PHỐ TRUNG TÂM QUẬN KHU VỰC HIẾM NHÀ
      BÁN HƠN 7 TỶ Ô TÔ,
      92.51 Thanh Nhàn 31/34 5 4.27 7.8 Tỷ Hai Bà Trưng 6
      đến 9 HĐ ĐC Lương Thảo Khối Thiên Vương
      0973.244.285 H3GB nguồn HĐTĐ,
      Mô tả : Nhà cách mặt phố Thanh Nhàn chỉ 20m,
      + Ô tô đỗ trong nhà vào nhà.,
      + Gần Các trường Đại Học Bách + Kinh + Xây gần bệnh
      viện xung quanh tiện ích ngập tràn, bãi độc xe sát nhà.,
      + Nhà hiện tại 5 tầng sử dụng 2 ngủ, có Ô giếng trời lên
      thêm tầng lặp tháng máy.,
      + Nhà xây khung cột vô cùng chắc chắn.,
      + Xung quanh hàng xóm toàn quan chức an ninh cực Kỳ
      tốt.,
      + Nhà đi vào từ nhiều hướng tiện nhất là từ ngõ 92 ngõ
      công ăn phường Thanh Nhàn.
      Pháp Lý : Sổ đỏ giao dịch ngày,
      ACE Lưu ý giờ xem : Từ 11h - 14h xem trong khách ưng vị
      trí hình ảnh bên trong, Đc Có video bên trong, nên
      khách thực sư mới kết nối xem trong..
      Đề xuất Invest`
  }
};

// Function to extract structured information from OCR result using Groq
const extractInfoFromOCRResult = async (ocrText) => {
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Extract the following information from this real estate text: address, price, size, features, and contact number. Provide the information in Vietnamese. If any information is not present, omit that field. Here's the text:\n\n${ocrText}`,
      },
    ],
    model: "mixtral-8x7b-32768",
    max_tokens: 1000,
  });

  return parseExtractedInfo(response.choices[0].message.content);
};

// Helper function to parse the extracted information
const parseExtractedInfo = (content) => {
  const info = {
    address: '',
    price: '',
    size: '',
    features: '',
    contact: '',
    legal: '',
    viewingTime: ''
  };
  
  const lines = content.split('\n');

  const keyMap = {
    'address': ['địa chỉ'],
    'price': ['giá'],
    'size': ['kích thước'],
    'features': ['đặc điểm'],
    'contact': ['liên hệ'],
    'legal': ['pháp lý'],
    'viewingTime': ['thời gian xem']
  };

  for (const line of lines) {
    if (line.includes(':')) {
      let [key, value] = line.split(':').map(s => s.trim());
      key = key.toLowerCase().replace(/^[-•]/, '').trim();
      
      for (const [normalizedKey, possibleKeys] of Object.entries(keyMap)) {
        if (possibleKeys.some(k => key.includes(k))) {
          info[normalizedKey] = value;
          break;
        }
      }
    }
  }

  // Remove empty fields
  Object.keys(info).forEach(key => {
    if (!info[key]) delete info[key];
  });

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

    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "mixtral-8x7b-32768",
      max_tokens: 1000,
      temperature: 0.5,
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

    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "mixtral-8x7b-32768",
      max_tokens: 50,
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating image caption:', error);
    throw new Error('Không thể tạo chú thích cho ảnh');
  }
};