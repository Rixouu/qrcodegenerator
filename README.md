# QR Code Generator

A modern, responsive QR code generator built with Next.js, TypeScript, and Shadcn UI. Generate customizable QR codes for any URL or text and download them as PNG images.

## Features

- Generate QR codes from any text or URL input
- Customize QR code colors (foreground and background)
- Real-time QR code preview as you type
- Download QR codes as PNG images
- Responsive design works on desktop and mobile
- Toast notifications for user feedback

## Technologies Used

- [Next.js](https://nextjs.org/) with App Router
- TypeScript
- [react-qr-code](https://www.npmjs.com/package/react-qr-code) for QR code generation
- [Shadcn UI](https://ui.shadcn.com/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Sonner](https://sonner.emilkowal.ski/) for toast notifications

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/qrcode-generator.git
cd qrcode-generator
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. Enter any URL or text in the input field
2. Use the color pickers to customize the foreground and background colors
3. The QR code updates automatically as you type
4. Click the "Download QR Code" button to save the QR code as a PNG image

## Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

Then, you can start the production server:

```bash
npm run start
# or
yarn start
```

## Deployment

The easiest way to deploy your QR Code Generator is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

For more deployment options, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
- [react-qr-code](https://www.npmjs.com/package/react-qr-code) for QR code generation functionality
