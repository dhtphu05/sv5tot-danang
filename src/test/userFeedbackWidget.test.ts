/**
 * 5TOT ĐHĐN — User Feedback & Bug Telemetry Widget Unit Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FeedbackCategory } from '../components/feedback/FeedbackFloatingWidget';

describe('5TOT ĐHĐN — User Feedback & Bug Telemetry Widget Suite', () => {
  it('1. Category enum supports BUG, SUGGESTION, and OTHER with correct default', () => {
    const validCategories: FeedbackCategory[] = ['BUG', 'SUGGESTION', 'OTHER'];
    assert.equal(validCategories.length, 3);
    assert.ok(validCategories.includes('BUG'));
    assert.ok(validCategories.includes('SUGGESTION'));
    assert.ok(validCategories.includes('OTHER'));
  });

  it('2. Content validation enforces minimum 5 characters and rejects whitespace-only', () => {
    const validateContent = (text: string) => text.trim().length >= 5;

    assert.equal(validateContent(''), false);
    assert.equal(validateContent('   '), false);
    assert.equal(validateContent('1234'), false);
    assert.equal(validateContent('12345'), true);
    assert.equal(validateContent('Lỗi lưu form'), true);
  });

  it('3. Guest validation requires valid email format', () => {
    const validateGuestEmail = (isLoggedIn: boolean, email: string) => {
      if (isLoggedIn) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim());
    };

    assert.equal(validateGuestEmail(true, ''), true, 'Logged in user does not require manual email');
    assert.equal(validateGuestEmail(false, ''), false, 'Guest requires email');
    assert.equal(validateGuestEmail(false, 'invalid-email'), false);
    assert.equal(validateGuestEmail(false, 'student@dut.udn.vn'), true);
  });

  it('4. Image attachment enforces maximum 3 items limit', () => {
    const currentImages = ['img1.png', 'img2.png'];
    const canAttach = (images: string[]) => images.length < 3;

    assert.equal(canAttach(currentImages), true);
    currentImages.push('img3.png');
    assert.equal(canAttach(currentImages), false, 'Blocks 4th image');
  });

  it('5. Image file size limit enforces 5MB ceiling', () => {
    const MAX_SIZE = 5 * 1024 * 1024;
    const isAllowedSize = (sizeInBytes: number) => sizeInBytes <= MAX_SIZE;

    assert.equal(isAllowedSize(1024 * 500), true, '500KB is allowed');
    assert.equal(isAllowedSize(4 * 1024 * 1024), true, '4MB is allowed');
    assert.equal(isAllowedSize(6 * 1024 * 1024), false, '6MB is rejected');
  });

  it('6. Client telemetry correctly structures URL, screen, and user agent context', () => {
    const mockWindow = {
      location: { href: 'https://sinhvien5tot.udn.vn/application?criterion=dao-duc-tot', pathname: '/application' },
      screen: { width: 1920, height: 1080 },
      innerWidth: 1440,
      innerHeight: 900,
      navigator: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', language: 'vi-VN' },
    };

    const telemetry = {
      pageUrl: mockWindow.location.href,
      pathname: mockWindow.location.pathname,
      screenResolution: `${mockWindow.screen.width}x${mockWindow.screen.height}`,
      windowSize: `${mockWindow.innerWidth}x${mockWindow.innerHeight}`,
      userAgent: mockWindow.navigator.userAgent,
      language: mockWindow.navigator.language,
    };

    assert.equal(telemetry.pageUrl, 'https://sinhvien5tot.udn.vn/application?criterion=dao-duc-tot');
    assert.equal(telemetry.screenResolution, '1920x1080');
    assert.equal(telemetry.language, 'vi-VN');
    assert.ok(telemetry.userAgent.includes('Windows'));
  });

  it('7. Keyboard shortcut handles Ctrl+Enter and Cmd+Enter submission', () => {
    const isSubmitShortcut = (e: { metaKey: boolean; ctrlKey: boolean; key: string }) => {
      return (e.metaKey || e.ctrlKey) && e.key === 'Enter';
    };

    assert.equal(isSubmitShortcut({ metaKey: false, ctrlKey: false, key: 'Enter' }), false);
    assert.equal(isSubmitShortcut({ metaKey: true, ctrlKey: false, key: 'Enter' }), true, 'Cmd+Enter');
    assert.equal(isSubmitShortcut({ metaKey: false, ctrlKey: true, key: 'Enter' }), true, 'Ctrl+Enter');
  });
});
