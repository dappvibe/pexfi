import PropTypes from 'prop-types'

export default function ExplorerLink({ children, address, tx = false }) {
  //const explorer = 'https://arbiscan.io/address/';
  const explorer = 'http://localhost/address/'

  return (
    <a href={explorer + address} target={'_blank'}>
      {children}
    </a>
  )
}

ExplorerLink.propTypes = {
  children: PropTypes.node.isRequired,
  address: PropTypes.string.isRequired,
  tx: PropTypes.bool,
}
