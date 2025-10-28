<template>
  <Html>
    <Head />
    <Preview>{{ previewText }}</Preview>
    <Body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
      <Container style="background-color: #ffffff; border: 1px solid #f0f0f0; padding: 45px; margin: 40px auto; border-radius: 8px; max-width: 600px;">
        <!-- Header -->
        <Section>
          <Row>
            <Column style="text-align: center;">
              <Img 
                :src="logoUrl" 
                :alt="title"
                style="display: block; margin: 0 auto 32px; max-width: 150px;"
              />
            </Column>
          </Row>
        </Section>

        <!-- Main Content -->
        <Section>
          <Row>
            <Column>
              <Heading style="color: #333; font-size: 24px; font-weight: bold; text-align: center; margin: 0 0 32px;">
                {{ contentTitle }}
              </Heading>
              <Text style="color: #333; font-size: 16px; line-height: 26px; margin: 0 0 32px;">
                {{ contentText }}
              </Text>
            </Column>
          </Row>
        </Section>

        <!-- Button -->
        <Section>
          <Row>
            <Column style="text-align: center;">
              <Button 
                :href="buttonUrl"
                :style="{
                  backgroundColor: buttonColor,
                  borderRadius: '5px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'inline-block',
                  width: '200px',
                  padding: '12px 0'
                }"
              >
                {{ buttonText }}
              </Button>
            </Column>
          </Row>
        </Section>

        <!-- Divider -->
        <Hr style="border: none; border-top: 1px solid #eaeaea; margin: 32px 0;" />

        <!-- Footer -->
        <Section>
          <Row>
            <Column>
              <Text style="color: #666; font-size: 12px; line-height: 18px; text-align: center; margin: 0; white-space: pre-line;">
                {{ footerText }}
              </Text>
            </Column>
          </Row>
        </Section>
      </Container>
    </Body>
  </Html>
</template>

<script>
import { 
  Html, 
  Head, 
  Preview, 
  Body, 
  Container, 
  Section, 
  Row, 
  Column, 
  Heading, 
  Text, 
  Button, 
  Img, 
  Hr 
} from '@vue-email/components';

export default {
  name: 'EmailTemplate',
  components: {
    Html,
    Head,
    Preview,
    Body,
    Container,
    Section,
    Row,
    Column,
    Heading,
    Text,
    Button,
    Img,
    Hr
  },
  props: {
    previewText: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    logoUrl: {
      type: String,
      default: ''
    },
    contentTitle: {
      type: String,
      default: ''
    },
    contentText: {
      type: String,
      default: ''
    },
    buttonText: {
      type: String,
      default: ''
    },
    buttonUrl: {
      type: String,
      default: ''
    },
    buttonColor: {
      type: String,
      default: '#007bff'
    },
    footerText: {
      type: String,
      default: ''
    }
  }
};
</script>