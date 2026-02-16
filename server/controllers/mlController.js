import multer from 'multer';

// Use memory storage to process file buffer directly without saving to disk first
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

export const runPhase1 = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { buses, shuttles } = req.body;

        if (!buses || !shuttles) {
            return res.status(400).json({ error: 'Buses and shuttles count are required' });
        }

        // Prepare form data for the Python service
        const formData = new FormData();
        formData.append('buses', buses);
        formData.append('shuttles', shuttles);

        // Append the file buffer as a Blob
        const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append('file', fileBlob, req.file.originalname);

        const response = await fetch('http://127.0.0.1:8000/run-phase1', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ML Service Error: ${errorText}`);
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Error in runPhase1:', error);
        res.status(500).json({ error: error.message });
    }
};

export const runPhase2 = async (req, res) => {
    try {
        const response = await fetch('http://127.0.0.1:8000/run-phase2', {
            method: 'POST',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ML Service Error: ${errorText}`);
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Error in runPhase2:', error);
        res.status(500).json({ error: error.message });
    }
};

export { upload };
