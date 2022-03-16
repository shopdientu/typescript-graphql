import React, { ReactNode } from 'react'
import Navbar from './Navbar'
import Wrapper from './Wrapper'

interface ILayoutProps {
  children: ReactNode
}

const Layout = ({ children }: ILayoutProps) => {
  return (
    <>
      <Navbar />
      <Wrapper size="regular">{children}</Wrapper>
    </>
  )
}

export default Layout
