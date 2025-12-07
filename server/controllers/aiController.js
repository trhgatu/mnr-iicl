
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Setup Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Function to convert buffer to a Gemini-compatible format
const fileToGenerativePart = (buffer, mimeType) => {
    return {
        inlineData: {
            data: buffer.toString('base64'),
            mimeType,
        },
    };
};

// @desc    Analyze container damage from images
// @route   POST /api/ai/analyze-damage
// @access  Private
exports.analyzeDamage = async (req, res, next) => {
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ success: false, message: 'Chưa cấu hình Gemini API key.' });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'Vui lòng tải lên ít nhất một hình ảnh.' });
    }

    try {
        const imageParts = req.files.map(file => fileToGenerativePart(file.buffer, file.mimetype));

        const prompt = `
            Phân tích (các) hình ảnh sau đây về một container vận chuyển. Xác định tất cả các hư hỏng.
            Đối với mỗi hư hỏng tìm thấy, cung cấp các chi tiết sau:
            - location: Mô tả ngắn gọn, rõ ràng về vị trí hư hỏng trên container.
            - type: Phân loại hư hỏng bằng cách sử dụng một trong các mã IICL sau: DE (Móp), SC (Vết xước), HO (Lỗ), BE (Cong vênh), BR (Gãy), CR (Ăn mòn/Gỉ sét), MI (Thiếu bộ phận). Nếu loại hư hỏng không phù hợp, hãy sử dụng 'OT' (Khác).
            - severity: Đánh giá mức độ nghiêm trọng là 'Nhẹ', 'Trung bình', hoặc 'Nghiêm trọng'.
            - size: Kích thước ước tính của hư hỏng (ví dụ: "15cm x 10cm", "20cm dài").

            Phản hồi của bạn PHẢI là một mảng JSON hợp lệ gồm các đối tượng, với mỗi đối tượng đại diện cho một hư hỏng duy nhất.
            Ví dụ định dạng phản hồi:
            [
                {
                    "location": "Góc trên bên trái, mặt trước",
                    "type": "DE",
                    "severity": "Trung bình",
                    "size": "20cm x 5cm"
                },
                {
                    "location": "Dưới bên phải, tấm cửa",
                    "type": "SC",
                    "severity": "Nhẹ",
                    "size": "30cm dài"
                }
            ]

            Nếu không tìm thấy hư hỏng nào, hãy trả về một mảng rỗng []. Không trả về bất kỳ văn bản hoặc giải thích nào ngoài mảng JSON.
        `;

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();

        // Clean the response to ensure it's valid JSON
        const jsonResponse = text.replace(/```json|```/g, '').trim();

        let data;
        try {
            data = JSON.parse(jsonResponse);
        } catch (e) {
            console.error('Failed to parse Gemini response as JSON:', jsonResponse);
            return res.status(500).json({ success: false, message: 'Phân tích từ AI không hợp lệ. Phản hồi không đúng định dạng JSON.', rawData: jsonResponse });
        }

        res.status(200).json({
            success: true,
            message: 'Analysis complete',
            data: data,
        });

    } catch (error) {
        console.error('Error during Gemini analysis:', error);
        res.status(500).json({ success: false, message: 'An error occurred during the AI analysis.' });
    }
};

