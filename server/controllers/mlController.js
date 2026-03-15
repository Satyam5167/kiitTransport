import multer from 'multer';

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const runAll = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { buses, shuttles } = req.body;

        const formData = new FormData();
        formData.append('buses', buses);
        formData.append('shuttles', shuttles);

        const fileBlob = new Blob([req.file.buffer], {
            type: req.file.mimetype
        });

        formData.append('file', fileBlob, req.file.originalname);

        const response = await fetch('http://127.0.0.1:8000/api/ml/run-all', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const data = await response.json();

        // IMPORTANT: send ML result to frontend
        res.json(data);

    } catch (error) {
        console.error("Run-All Error:", error);
        res.status(500).json({ error: error.message });
    }
};