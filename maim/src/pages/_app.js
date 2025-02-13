import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import Navbar from '@/components/common/Navbar';
import { Box } from '@chakra-ui/react';
// import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ChakraProvider>
        <Navbar />
        <Box pt="60px"> {/* Navbar 높이만큼 상단 여백 추가 */}
          <Component {...pageProps} />
        </Box>
      </ChakraProvider>
    </SessionProvider>
  );
}

export default MyApp; 