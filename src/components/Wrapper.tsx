import React, { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'

interface IWrapperProps {
  children: ReactNode
  size?: 'regular' | 'small'
}

const Wrapper = ({ children, size = 'regular' }: IWrapperProps) => {
  return (
    <Box marginBottom={10} maxW={size === 'regular' ? 800 : 400} mt={8} mx="auto">
      {children}
    </Box>
  )
}

export default Wrapper
