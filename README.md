# RunPod Chat Interface

A Next.js chat interface that connects to RunPod's AI endpoints. This project uses the Vercel AI SDK for streaming responses and provides a clean, modern UI.

## Features

- Real-time streaming responses
- Modern chat interface
- Easy deployment to Vercel
- Support for any RunPod endpoint
- Built with Next.js 14 and TypeScript

## Prerequisites

- Node.js 18+ and npm
- A RunPod account with an active endpoint
- Your RunPod API key

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/runpod-chat.git
cd runpod-chat
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your RunPod credentials:
```env
RUNPOD_API_KEY=your_api_key_here
RUNPOD_ENDPOINT_ID=your_endpoint_id_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in the Vercel project settings:
   - `RUNPOD_API_KEY`
   - `RUNPOD_ENDPOINT_ID`
4. Deploy!

## Environment Variables

- `RUNPOD_API_KEY`: Your RunPod API key
- `RUNPOD_ENDPOINT_ID`: Your RunPod endpoint ID

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes. 