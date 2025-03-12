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

## Dependencies

### Core Dependencies
- `next`: 14.1.0 - Next.js framework
- `react`: ^18.2.0 - React library
- `react-dom`: ^18.2.0 - React DOM rendering
- `ai`: ^2.2.37 - Vercel AI SDK for streaming responses
- `axios`: ^1.6.7 - HTTP client for API requests

### Development Dependencies
- `typescript`: ^5.3.3 - TypeScript support
- `tailwindcss`: ^3.4.1 - CSS framework
- `postcss`: ^8.4.35 - CSS processing
- `autoprefixer`: ^10.4.17 - CSS vendor prefixing
- `eslint`: ^8.56.0 - Code linting
- `eslint-config-next`: 14.1.0 - Next.js ESLint configuration

## RunPod Setup

1. Create a RunPod account at [RunPod.io](https://www.runpod.io)
2. Get your API key:
   - Go to your [RunPod Dashboard](https://www.runpod.io/console/serverless)
   - Click on "API Keys" in the sidebar
   - Create a new API key
   - Copy the API key (you'll only see it once!)

3. Create a Serverless Endpoint:
   - Go to the [Serverless](https://www.runpod.io/console/serverless) section
   - Click "New Endpoint"
   - Choose your preferred model (e.g., Llama 2, Mistral, etc.)
   - Configure your endpoint settings:
     - Name: Choose a descriptive name
     - GPU: Select based on your needs
     - Idle Timeout: Set based on your usage patterns
     - Max Workers: Adjust based on expected concurrent users
   - Click "Create Endpoint"
   - Wait for the endpoint to be ready (status should be "ONLINE")
   - Copy your endpoint ID

## Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/zgulsby/RunPod-Vercel-AI-SDK.git
cd RunPod-Vercel-AI-SDK
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   - Edit `.env.local` with your RunPod credentials:
   ```env
   RUNPOD_API_KEY=your_api_key_here
   RUNPOD_ENDPOINT_ID=your_endpoint_id_here
   ```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Deploy on Vercel:
   - Go to [Vercel](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "New Project"
   - Import your GitHub repository
   - Add your environment variables in the Vercel project settings:
     - `RUNPOD_API_KEY`: Your RunPod API key
     - `RUNPOD_ENDPOINT_ID`: Your RunPod endpoint ID
   - Click "Deploy"

## Cost Management

- Monitor your RunPod usage in the [RunPod Dashboard](https://www.runpod.io/console/serverless)
- Set up billing alerts in your RunPod account
- Consider setting up a maximum budget in RunPod
- The serverless endpoint charges only for active compute time

## Troubleshooting

1. If you get a 404 error:
   - Verify your endpoint ID is correct
   - Check if your endpoint is online in the RunPod dashboard
   - Ensure your API key has the correct permissions

2. If responses are slow:
   - Check your endpoint's GPU configuration
   - Monitor the RunPod dashboard for any throttling
   - Consider upgrading your endpoint's resources

3. If you get authentication errors:
   - Verify your API key is correct
   - Check if your API key is properly set in Vercel
   - Ensure your API key hasn't expired

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes. 