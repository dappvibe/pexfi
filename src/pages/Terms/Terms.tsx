import { Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function Terms() {
  return (
    <Card style={{ marginTop: '20px' }}>
      <Typography>
        <Title level={2}>Terms of Use</Title>
        <Paragraph>Describe basic terms that place very few restrictions.</Paragraph>
        <ul>
          <li>
            <Paragraph>No Spam</Paragraph>
          </li>
          <li>
            <Paragraph>No Hacking</Paragraph>
          </li>
          <li>
            <Paragraph>Very few rules applicable to each deal (TBD)</Paragraph>
          </li>
        </ul>
      </Typography>
    </Card>
  )
}
