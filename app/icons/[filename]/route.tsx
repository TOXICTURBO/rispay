import { ImageResponse } from 'next/og';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const size = filename.includes('512') ? 512 : 192;
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: size * 0.4,
          background: '#1F4ED8',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: size * 0.06,
        }}
      >
        R
      </div>
    ),
    { width: size, height: size }
  );
}
