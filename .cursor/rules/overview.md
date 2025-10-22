# The Box - Project Overview

A hackweek project that monitors Sentry commits and announces them via TTS audio and a physical light beacon on Raspberry Pi.

## What It Does

1. Polls Sentry API for production releases
2. Extracts commits from releases
3. Matches commits against configured rules
4. Generates personalized voice announcements
5. Plays sound effects + speaks commit message
6. Controls physical light beacon during announcement

## Purpose

Celebrate team contributions by announcing production deployments with fun, personalized audio and visual effects in the office.

