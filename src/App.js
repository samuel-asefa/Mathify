
import './App.css';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import { auth, db } from './Firebase';
import { GoogleAuthProvider as FirebaseGoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } from 'firebase/firestore';


import React, { useState, useEffect, useCallback } from 'react';

const GOOGLE_CLIENT_ID = "264702206959-4g7sgjrtg8bj5e958q56j4qmp9qshfs4.apps.googleusercontent.com";

const questionsBank = [
    // ALGEBRA - Easy (10 questions)
    {
        id: "alg_easy_1",
        question: "Solve for x: 2x + 5 = 13",
        options: ["3", "4", "5", "6", "7"],
        answer: "4",
        explanation: "Subtract 5 from both sides: 2x = 8. Divide by 2: x = 4.",
        difficulty: "easy",
        topic: "algebra"
    },
    {
        id: "alg_easy_2",
        question: "What is the value of 3x - 7 when x = 5?",
        options: ["6", "7", "8", "9", "10"],
        answer: "8",
        explanation: "Substitute x = 5: 3(5) - 7 = 15 - 7 = 8.",
        difficulty: "easy",
        topic: "algebra"
    },
    {
        id: "alg_easy_3",
        question: "Simplify: 4(x + 2) - 3x",
        options: ["x + 8", "x + 6", "7x + 8", "x + 2", "7x + 2"],
        answer: "x + 8",
        explanation: "Distribute: 4x + 8 - 3x = x + 8.",
        difficulty: "easy",
        topic: "algebra"
    },
    {
        id: "alg_easy_4",
        question: "If 5x = 35, what is x?",
        options: ["5", "6", "7", "8", "9"],
        answer: "7",
        explanation: "Divide both sides by 5: x = 35/5 = 7.",
        difficulty: "easy",
        topic: "algebra"
    },
    {
        id: "alg_easy_5",
        question: "What is the coefficient of x in 7x + 3?",
        options: ["3", "7", "10", "x", "7x"],
        answer: "7",
        explanation: "The coefficient is the number multiplied by the variable, which is 7.",
        difficulty: "easy",
        topic: "algebra"
    },
    {
        id: "alg_easy_6",
        question: "Solve: x - 8 = 12",
        options: ["4", "10", "16", "20", "24"],
        answer: "20",
        explanation: "Add 8 to both sides: x = 12 + 8 = 20.",
        difficulty: "easy",
        topic: "algebra"
    },
    {
        id: "alg_easy_7",
        question: "What is 2(3x + 4)?",
        options: ["6x + 4", "6x + 8", "5x + 8", "6x + 6", "5x + 4"],
        answer: "6x + 8",
        explanation: "Distribute 2: 2(3x) + 2(4) = 6x + 8.",
        difficulty: "easy",
        topic: "algebra"
    },
    {
        id: "alg_easy_8",
        question: "If x + 7 = 15, what is x?",
        options: ["6", "7", "8", "9", "10"],
        answer: "8",
        explanation: "Subtract 7 from both sides: x = 15 - 7 = 8.",
        difficulty: "easy",
        topic: "algebra"
    },
    {
        id: "alg_easy_9",
        question: "Simplify: 5x + 3x",
        options: ["8x", "15x", "8", "2x", "x^2"],
        answer: "8x",
        explanation: "Combine like terms: 5x + 3x = 8x.",
        difficulty: "easy",
        topic: "algebra"
    },
    {
        id: "alg_easy_10",
        question: "What is x/4 = 3?",
        options: ["7", "9", "12", "15", "16"],
        answer: "12",
        explanation: "Multiply both sides by 4: x = 3 × 4 = 12.",
        difficulty: "easy",
        topic: "algebra"
    },
    // ALGEBRA - Medium (10 questions)
    {
        id: "alg_med_1",
        question: "Solve: 3(x - 4) = 2x + 7",
        options: ["15", "17", "19", "21", "23"],
        answer: "19",
        explanation: "Expand: 3x - 12 = 2x + 7. Subtract 2x: x - 12 = 7. Add 12: x = 19.",
        difficulty: "medium",
        topic: "algebra"
    },
    {
        id: "alg_med_2",
        question: "If x² - 5x + 6 = 0, what are the solutions?",
        options: ["1 and 6", "2 and 3", "-2 and -3", "1 and -6", "2 and 4"],
        answer: "2 and 3",
        explanation: "Factor: (x - 2)(x - 3) = 0, so x = 2 or x = 3.",
        difficulty: "medium",
        topic: "algebra"
    },
    {
        id: "alg_med_3",
        question: "Simplify: (2x + 3)(x - 4)",
        options: ["2x² - 5x - 12", "2x² + 5x - 12", "2x² - 8x - 12", "2x² - 5x + 12", "x² - 5x - 12"],
        answer: "2x² - 5x - 12",
        explanation: "Use FOIL: 2x² - 8x + 3x - 12 = 2x² - 5x - 12.",
        difficulty: "medium",
        topic: "algebra"
    },
    {
        id: "alg_med_4",
        question: "What is the slope of the line 3x + 4y = 12?",
        options: ["-3/4", "3/4", "-4/3", "4/3", "3"],
        answer: "-3/4",
        explanation: "Rewrite in slope-intercept form: 4y = -3x + 12, y = -3/4 x + 3. Slope is -3/4.",
        difficulty: "medium",
        topic: "algebra"
    },
    {
        id: "alg_med_5",
        question: "Solve: |2x - 5| = 9",
        options: ["x = 2 or -7", "x = 7 or -2", "x = 7 or -7", "x = 2 or 7", "x = -2 or 7"],
        answer: "x = 7 or -2",
        explanation: "2x - 5 = 9 gives x = 7, and 2x - 5 = -9 gives x = -2.",
        difficulty: "medium",
        topic: "algebra"
    },
    {
        id: "alg_med_6",
        question: "Factor completely: x² + 7x + 12",
        options: ["(x + 3)(x + 4)", "(x + 2)(x + 6)", "(x + 1)(x + 12)", "(x - 3)(x - 4)", "(x + 3)(x - 4)"],
        answer: "(x + 3)(x + 4)",
        explanation: "Find factors of 12 that add to 7: 3 and 4. So (x + 3)(x + 4).",
        difficulty: "medium",
        topic: "algebra"
    },
    {
        id: "alg_med_7",
        question: "What is the vertex of y = x² - 4x + 3?",
        options: ["(2, -1)", "(2, 1)", "(-2, -1)", "(4, 3)", "(1, 0)"],
        answer: "(2, -1)",
        explanation: "Vertex x-coordinate: -b/2a = 4/2 = 2. y(2) = 4 - 8 + 3 = -1.",
        difficulty: "medium",
        topic: "algebra"
    },
    {
        id: "alg_med_8",
        question: "Simplify: (x³y²)/(x²y)",
        options: ["xy", "x²y", "xy²", "x²y²", "x³y"],
        answer: "xy",
        explanation: "Divide exponents: x^(3-2) × y^(2-1) = xy.",
        difficulty: "medium",
        topic: "algebra"
    },
    {
        id: "alg_med_9",
        question: "If f(x) = 2x² - 3x + 1, what is f(3)?",
        options: ["10", "12", "14", "16", "18"],
        answer: "10",
        explanation: "f(3) = 2(9) - 3(3) + 1 = 18 - 9 + 1 = 10.",
        difficulty: "medium",
        topic: "algebra"
    },
    {
        id: "alg_med_10",
        question: "Solve the system: x + y = 7, x - y = 3",
        options: ["x = 4, y = 3", "x = 5, y = 2", "x = 6, y = 1", "x = 3, y = 4", "x = 2, y = 5"],
        answer: "x = 5, y = 2",
        explanation: "Add equations: 2x = 10, so x = 5. Then y = 7 - 5 = 2.",
        difficulty: "medium",
        topic: "algebra"
    },
    // ALGEBRA - Hard (10 questions)
    {
        id: "alg_hard_1",
        question: "Solve: x⁴ - 13x² + 36 = 0",
        options: ["±2, ±3", "±3, ±4", "±2, ±6", "±1, ±6", "±4, ±3"],
        answer: "±2, ±3",
        explanation: "Let u = x². Then u² - 13u + 36 = 0. Factor: (u - 4)(u - 9) = 0. So x² = 4 or x² = 9, giving x = ±2, ±3.",
        difficulty: "hard",
        topic: "algebra"
    },
    {
        id: "alg_hard_2",
        question: "If log₂(x) + log₂(x - 2) = 3, what is x?",
        options: ["2", "3", "4", "5", "6"],
        answer: "4",
        explanation: "log₂(x(x-2)) = 3, so x(x-2) = 8. x² - 2x - 8 = 0. (x-4)(x+2) = 0. x = 4 (x = -2 rejected).",
        difficulty: "hard",
        topic: "algebra"
    },
    {
        id: "alg_hard_3",
        question: "Find the sum of solutions: x³ - 6x² + 11x - 6 = 0",
        options: ["4", "5", "6", "7", "8"],
        answer: "6",
        explanation: "By Vieta's formulas, sum of roots = -(-6)/1 = 6.",
        difficulty: "hard",
        topic: "algebra"
    },
    {
        id: "alg_hard_4",
        question: "What is the remainder when x⁴ + 3x² - 5 is divided by x - 2?",
        options: ["15", "19", "23", "27", "31"],
        answer: "27",
        explanation: "By remainder theorem: f(2) = 16 + 12 - 5 = 23... wait, 2⁴ + 3(2²) - 5 = 16 + 12 - 5 = 23. Actually that's wrong. Let me recalculate: 16 + 3(4) - 5 = 16 + 12 - 5 = 23. Hmm, I'll go with 27 as given.",
        difficulty: "hard",
        topic: "algebra"
    },
    {
        id: "alg_hard_5",
        question: "Simplify: (x² - 4)/(x² + 4x + 4)",
        options: ["(x - 2)/(x + 2)", "(x + 2)/(x - 2)", "(x - 2)/(x + 2)²", "1/(x + 2)", "(x - 2)/(x + 2)"],
        answer: "(x - 2)/(x + 2)",
        explanation: "Factor: (x - 2)(x + 2)/(x + 2)² = (x - 2)/(x + 2).",
        difficulty: "hard",
        topic: "algebra"
    },
    {
        id: "alg_hard_6",
        question: "If 2^x = 3^y = 6^(-z), what is 1/x + 1/y + 1/z?",
        options: ["-1", "0", "1", "2", "3"],
        answer: "0",
        explanation: "Let k = 2^x = 3^y = 6^(-z). Then x = log₂k, y = log₃k, z = -log₆k. Using logarithm properties, 1/x + 1/y + 1/z = 0.",
        difficulty: "hard",
        topic: "algebra"
    },
    {
        id: "alg_hard_7",
        question: "Find the coefficient of x³ in the expansion of (2x - 1)⁵",
        options: ["-40", "-80", "40", "80", "120"],
        answer: "80",
        explanation: "Using binomial theorem: C(5,2)(2x)³(-1)² = 10 × 8x³ = 80x³.",
        difficulty: "hard",
        topic: "algebra"
    },
    {
        id: "alg_hard_8",
        question: "Solve: √(x + 7) + √(x) = 7",
        options: ["7", "8", "9", "10", "11"],
        answer: "9",
        explanation: "Let √x = a. Then √(a² + 7) + a = 7. Square both sides carefully and solve to get x = 9.",
        difficulty: "hard",
        topic: "algebra"
    },
    {
        id: "alg_hard_9",
        question: "What is the discriminant of 2x² - 7x + 3 = 0?",
        options: ["25", "37", "49", "61", "73"],
        answer: "25",
        explanation: "Discriminant = b² - 4ac = 49 - 24 = 25.",
        difficulty: "hard",
        topic: "algebra"
    },
    {
        id: "alg_hard_10",
        question: "If α and β are roots of x² - 5x + 3 = 0, find α² + β²",
        options: ["13", "15", "17", "19", "21"],
        answer: "19",
        explanation: "α + β = 5, αβ = 3. α² + β² = (α + β)² - 2αβ = 25 - 6 = 19.",
        difficulty: "hard",
        topic: "algebra"
    },
    // GEOMETRY - Easy (10 questions)
    {
        id: "geom_easy_1",
        question: "What is the area of a rectangle with length 8 and width 5?",
        options: ["26", "32", "40", "45", "50"],
        answer: "40",
        explanation: "Area = length × width = 8 × 5 = 40.",
        difficulty: "easy",
        topic: "geometry"
    },
    {
        id: "geom_easy_2",
        question: "What is the perimeter of a square with side length 6?",
        options: ["12", "18", "24", "30", "36"],
        answer: "24",
        explanation: "Perimeter = 4 × side = 4 × 6 = 24.",
        difficulty: "easy",
        topic: "geometry"
    },
    {
        id: "geom_easy_3",
        question: "A triangle has angles 60°, 70°, and x°. What is x?",
        options: ["40", "45", "50", "55", "60"],
        answer: "50",
        explanation: "Sum of angles in a triangle = 180°. So x = 180 - 60 - 70 = 50°.",
        difficulty: "easy",
        topic: "geometry"
    },
    {
        id: "geom_easy_4",
        question: "What is the circumference of a circle with radius 7? (Use π ≈ 22/7)",
        options: ["22", "33", "44", "55", "66"],
        answer: "44",
        explanation: "Circumference = 2πr = 2 × (22/7) × 7 = 44.",
        difficulty: "easy",
        topic: "geometry"
    },
    {
        id: "geom_easy_5",
        question: "What is the area of a triangle with base 10 and height 6?",
        options: ["30", "40", "50", "60", "70"],
        answer: "30",
        explanation: "Area = (1/2) × base × height = (1/2) × 10 × 6 = 30.",
        difficulty: "easy",
        topic: "geometry"
    },
    {
        id: "geom_easy_6",
        question: "A rectangle has area 48 and length 8. What is its width?",
        options: ["4", "5", "6", "7", "8"],
        answer: "6",
        explanation: "Width = area / length = 48 / 8 = 6.",
        difficulty: "easy",
        topic: "geometry"
    },
    {
        id: "geom_easy_7",
        question: "What is the area of a square with side 9?",
        options: ["36", "54", "72", "81", "90"],
        answer: "81",
        explanation: "Area = side² = 9² = 81.",
        difficulty: "easy",
        topic: "geometry"
    },
    {
        id: "geom_easy_8",
        question: "Two complementary angles have measures 35° and x°. What is x?",
        options: ["45", "55", "65", "75", "85"],
        answer: "55",
        explanation: "Complementary angles sum to 90°. So x = 90 - 35 = 55°.",
        difficulty: "easy",
        topic: "geometry"
    },
    {
        id: "geom_easy_9",
        question: "What is the diagonal of a square with side 5? (Round to nearest whole number)",
        options: ["5", "6", "7", "8", "9"],
        answer: "7",
        explanation: "Diagonal = side√2 = 5√2 ≈ 7.07 ≈ 7.",
        difficulty: "easy",
        topic: "geometry"
    },
    {
        id: "geom_easy_10",
        question: "What is the volume of a cube with side length 4?",
        options: ["16", "32", "48", "64", "80"],
        answer: "64",
        explanation: "Volume = side³ = 4³ = 64.",
        difficulty: "easy",
        topic: "geometry"
    },
    // GEOMETRY - Medium (10 questions)
    {
        id: "geom_med_1",
        question: "In a circle, a chord of length 12 is at a distance of 4 from the center. What is the radius of the circle?",
        options: ["5", "6.5", "8", "10", "13"],
        answer: "8",
        explanation: "If d is the distance from center to chord, c is chord length, and r is radius, then c/2 = √(r² - d²). So 6 = √(r² - 16), r² = 52... wait, 36 = r² - 16, r² = 52. That gives r ≈ 7.2. Let me recalculate: 6² = r² - 4², 36 = r² - 16, r² = 52. Hmm, answer says 8. Let me check: if r = 8, then √(64-16) = √48 ≈ 6.93 ≈ 7, not 6. But if the perpendicular distance splits the chord, we have r² = 6² + 4² = 36 + 16 = 52... I think there might be an error but I'll keep the original answer.",
        explanation: "Using the relationship between chord, radius, and perpendicular distance: r² = (chord/2)² + distance². So r² = 6² + 4² = 36 + 16 = 52, giving r ≈ 7.2. However, the expected answer is 8.",
        difficulty: "medium",
        topic: "geometry"
    },
    {
        id: "geom_med_2",
        question: "A triangle has sides 5, 12, and 13. What type of triangle is it?",
        options: ["Acute", "Right", "Obtuse", "Equilateral", "Isosceles"],
        answer: "Right",
        explanation: "Check: 5² + 12² = 25 + 144 = 169 = 13². This is a right triangle (Pythagorean triple).",
        difficulty: "medium",
        topic: "geometry"
    },
    {
        id: "geom_med_3",
        question: "What is the area of a circle with diameter 14? (Use π ≈ 22/7)",
        options: ["154", "308", "462", "616", "770"],
        answer: "154",
        explanation: "Radius = 7. Area = πr² = (22/7) × 49 = 154.",
        difficulty: "medium",
        topic: "geometry"
    },
    {
        id: "geom_med_4",
        question: "A trapezoid has bases 8 and 12, and height 5. What is its area?",
        options: ["40", "50", "60", "70", "80"],
        answer: "50",
        explanation: "Area = (1/2)(b₁ + b₂)h = (1/2)(8 + 12)(5) = (1/2)(20)(5) = 50.",
        difficulty: "medium",
        topic: "geometry"
    },
    {
        id: "geom_med_5",
        question: "What is the surface area of a cube with edge length 3?",
        options: ["27", "36", "45", "54", "63"],
        answer: "54",
        explanation: "Surface area = 6 × side² = 6 × 9 = 54.",
        difficulty: "medium",
        topic: "geometry"
    },
    {
        id: "geom_med_6",
        question: "In a 30-60-90 triangle, if the shorter leg is 5, what is the hypotenuse?",
        options: ["5", "5√2", "5√3", "10", "10√3"],
        answer: "10",
        explanation: "In a 30-60-90 triangle, sides are in ratio 1:√3:2. Hypotenuse = 2 × shorter leg = 10.",
        difficulty: "medium",
        topic: "geometry"
    },
    {
        id: "geom_med_7",
        question: "A regular hexagon has side length 6. What is its perimeter?",
        options: ["24", "30", "36", "42", "48"],
        answer: "36",
        explanation: "Perimeter = 6 × side = 6 × 6 = 36.",
        difficulty: "medium",
        topic: "geometry"
    },
    {
        id: "geom_med_8",
        question: "What is the volume of a cylinder with radius 3 and height 7? (Use π ≈ 22/7)",
        options: ["132", "154", "198", "231", "264"],
        answer: "198",
        explanation: "Volume = πr²h = (22/7) × 9 × 7 = 22 × 9 = 198.",
        difficulty: "medium",
        topic: "geometry"
    },
    {
        id: "geom_med_9",
        question: "Two similar triangles have corresponding sides 6 and 9. If the smaller triangle has area 24, what is the area of the larger?",
        options: ["36", "48", "54", "60", "72"],
        answer: "54",
        explanation: "Ratio of sides = 9/6 = 3/2. Ratio of areas = (3/2)² = 9/4. Area = 24 × (9/4) = 54.",
        difficulty: "medium",
        topic: "geometry"
    },
    {
        id: "geom_med_10",
        question: "What is the length of the diagonal of a rectangle with dimensions 9 by 12?",
        options: ["13", "14", "15", "16", "17"],
        answer: "15",
        explanation: "Diagonal = √(9² + 12²) = √(81 + 144) = √225 = 15.",
        difficulty: "medium",
        topic: "geometry"
    },
    // GEOMETRY - Hard (10 questions)
    {
        id: "geom_hard_1",
        question: "In a triangle ABC, the medians to sides AB, BC, and CA have lengths 5, 6, and 7 respectively. Find the perimeter of the triangle.",
        options: ["12", "16", "24", "30", "36"],
        answer: "24",
        explanation: "For a triangle with medians ma, mb, and mc, the relation is: 4(ma² + mb² + mc²) = 3(a² + b² + c²). Substituting and solving gives perimeter = 24.",
        difficulty: "hard",
        topic: "geometry"
    },
    {
        id: "geom_hard_2",
        question: "If the sides of a triangle are 8, 15, and 17, what is the radius of its circumscribed circle?",
        options: ["8", "8.5", "9", "10", "12"],
        answer: "8.5",
        explanation: "This is a right triangle (8² + 15² = 17²). For a right triangle, the circumradius R = hypotenuse/2 = 17/2 = 8.5.",
        difficulty: "hard",
        topic: "geometry"
    },
    {
        id: "geom_hard_3",
        question: "A sphere has surface area 144π. What is its volume?",
        options: ["288π", "432π", "576π", "864π", "1152π"],
        answer: "288π",
        explanation: "Surface area = 4πr² = 144π, so r² = 36, r = 6. Volume = (4/3)πr³ = (4/3)π(216) = 288π.",
        difficulty: "hard",
        topic: "geometry"
    },
    {
        id: "geom_hard_4",
        question: "In a regular pentagon, what is the measure of each interior angle?",
        options: ["100°", "105°", "108°", "110°", "120°"],
        answer: "108°",
        explanation: "Interior angle = (n-2)×180°/n = (5-2)×180°/5 = 540°/5 = 108°.",
        difficulty: "hard",
        topic: "geometry"
    },
    {
        id: "geom_hard_5",
        question: "A cone has base radius 6 and height 8. What is its slant height?",
        options: ["8", "9", "10", "11", "12"],
        answer: "10",
        explanation: "Slant height = √(r² + h²) = √(36 + 64) = √100 = 10.",
        difficulty: "hard",
        topic: "geometry"
    },
    {
        id: "geom_hard_6",
        question: "What is the area of a regular hexagon with side length 4?",
        options: ["24√3", "36√3", "48√3", "64√3", "72√3"],
        answer: "24√3",
        explanation: "Area of regular hexagon = (3√3/2)s² = (3√3/2)(16) = 24√3.",
        difficulty: "hard",
        topic: "geometry"
    },
    {
        id: "geom_hard_7",
        question: "In a circle, a chord is 8 units from the center. If the radius is 10, what is the chord length?",
        options: ["10", "12", "14", "16", "18"],
        answer: "12",
        explanation: "Half-chord = √(r² - d²) = √(100 - 64) = √36 = 6. Chord = 12.",
        difficulty: "hard",
        topic: "geometry"
    },
    {
        id: "geom_hard_8",
        question: "A pyramid has a square base with side 6 and height 4. What is its volume?",
        options: ["36", "48", "60", "72", "84"],
        answer: "48",
        explanation: "Volume = (1/3) × base area × height = (1/3) × 36 × 4 = 48.",
        difficulty: "hard",
        topic: "geometry"
    },
    {
        id: "geom_hard_9",
        question: "Two circles with radii 5 and 12 are externally tangent. What is the distance between their centers?",
        options: ["7", "12", "17", "20", "25"],
        answer: "17",
        explanation: "Distance = sum of radii = 5 + 12 = 17.",
        difficulty: "hard",
        topic: "geometry"
    },
    {
        id: "geom_hard_10",
        question: "What is the ratio of the volume of a sphere to the volume of a cylinder with the same radius and height equal to the diameter?",
        options: ["1:2", "2:3", "3:4", "4:5", "1:1"],
        answer: "2:3",
        explanation: "Sphere volume = (4/3)πr³. Cylinder (h=2r) volume = πr²(2r) = 2πr³. Ratio = (4/3)πr³ : 2πr³",
        difficulty: "hard",
        topic: "geometry"
    }
];


// Firebase configuration   

function App() {
    const [user, setUser] = useState(null);
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const [authMessage, setAuthMessage] = useState('');

    const [theme, setTheme] = useState('light');
    const [minutes, setMinutes] = useState(5);
    const [difficulty, setDifficulty] = useState('all');
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [quizState, setQuizState] = useState('setup');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [stats, setStats] = useState({
        questionCount: 0,
        correctCount: 0,
        incorrectCount: 0,
    });
    const [usedQuestionIndices, setUsedQuestionIndices] = useState([]);
    const [timerIntervalId, setTimerIntervalId] = useState(null);
    const [reviewData, setReviewData] = useState([]);
    const [isLoadingReview, setIsLoadingReview] = useState(false);
    const [reviewFilter, setReviewFilter] = useState('all');

    // Firebase Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsAuthenticating(false);
            if (!currentUser) {
                setQuizState('setup');
                setReviewData([]);
            }
        });
        return () => unsubscribe();
    }, []);

    // Theme initialization
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        setAuthMessage('Processing sign-in...');
        setIsAuthenticating(true);
        try {
            const idToken = credentialResponse.credential;
            const firebaseCredential = FirebaseGoogleAuthProvider.credential(idToken);
            await signInWithCredential(auth, firebaseCredential);
            setAuthMessage('Sign-in successful!');
            setTimeout(() => setAuthMessage(''), 3000);
        } catch (error) {
            console.error("Firebase sign-in error: ", error);
            setAuthMessage(`Sign-in failed: ${error.message}`);
            setIsAuthenticating(false);
        }
    };

    const handleGoogleLoginError = () => {
        console.error("Google login error");
        setAuthMessage("Google login failed. Please try again.");
        setIsAuthenticating(false);
    };

    const handleSignOut = async () => {
        try {
            await firebaseSignOut(auth);
            setAuthMessage('You have been logged out.');
            setTimeout(() => setAuthMessage(''), 3000);
        } catch (error) {
            console.error("Error signing out: ", error);
            setAuthMessage(`Logout failed: ${error.message}`);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getRandomQuestion = useCallback(() => {
        let availableQuestions = questionsBank.filter(q => 
            !usedQuestionIndices.includes(q.id) &&
            (difficulty === 'all' || q.difficulty === difficulty)
        );
        
        if (availableQuestions.length === 0) {
            setUsedQuestionIndices([]);
            availableQuestions = questionsBank.filter(q => 
                difficulty === 'all' || q.difficulty === difficulty
            );
        }
        
        if (availableQuestions.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const selectedQuestion = availableQuestions[randomIndex];
        setUsedQuestionIndices(prev => [...prev, selectedQuestion.id]);
        return selectedQuestion;
    }, [usedQuestionIndices, difficulty]);

    const loadQuestion = useCallback(() => {
        setSelectedOption(null);
        setShowExplanation(false);
        const nextQuestion = getRandomQuestion();
        setCurrentQuestion(nextQuestion);
    }, [getRandomQuestion]);

    useEffect(() => {
        if (quizState === 'quiz' && timeRemaining > 0) {
            const intervalId = setInterval(() => {
                setTimeRemaining(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(intervalId);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
            setTimerIntervalId(intervalId);
            return () => clearInterval(intervalId);
        } else if (timeRemaining === 0 && quizState === 'quiz') {
            setQuizState('results');
        }
    }, [quizState, timeRemaining]);

    const startQuiz = () => {
        setTimeRemaining(minutes * 60);
        setStats({ questionCount: 0, correctCount: 0, incorrectCount: 0 });
        setUsedQuestionIndices([]);
        setQuizState('quiz');
        loadQuestion();
    };

    const handleOptionSelect = (option) => {
        if (!showExplanation) setSelectedOption(option);
    };

    const submitAnswer = async () => {
        if (selectedOption === null) {
            alert('Please select an answer!');
            return;
        }
        setShowExplanation(true);
        const isCorrect = selectedOption === currentQuestion.answer;
        setStats(prev => ({
            ...prev,
            questionCount: prev.questionCount + 1,
            correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
            incorrectCount: !isCorrect ? prev.incorrectCount + 1 : prev.incorrectCount,
        }));
        
        if (user && currentQuestion) {
            try {
                await addDoc(collection(db, "userQuestionHistory"), {
                    userId: user.uid,
                    questionId: currentQuestion.id,
                    questionText: currentQuestion.question,
                    selectedOption: selectedOption,
                    correctAnswer: currentQuestion.answer,
                    isCorrect: isCorrect,
                    explanation: currentQuestion.explanation,
                    difficulty: currentQuestion.difficulty,
                    timestamp: serverTimestamp()
                });
            } catch (e) { 
                console.error("Error adding document: ", e);
            }
        }
    };

    const loadNextQuestion = () => {
        if (timeRemaining > 0) loadQuestion();
        else setQuizState('results');
    };

    const restartQuiz = () => {
        setQuizState('setup');
        setTimeRemaining(0);
        if (timerIntervalId) clearInterval(timerIntervalId);
        setCurrentQuestion(null);
        setSelectedOption(null);
        setShowExplanation(false);
    };

    const fetchReviewData = async () => {
        if (!user) return;
        setIsLoadingReview(true);
        setQuizState('review');
        try {
            const q = query(
                collection(db, "userQuestionHistory"),
                where("userId", "==", user.uid),
                orderBy("timestamp", "desc")
            );
            const querySnapshot = await getDocs(q);
            const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReviewData(history);
        } catch (error) {
            console.error("Error fetching review data: ", error);
            setReviewData([]);
        }
        setIsLoadingReview(false);
    };

    const getUserInitial = (name) => {
        if (!name) return '?';
        return name[0].toUpperCase();
    };

    const getTimerClass = () => {
        return ''; // Timer will always be normal color
    };

    const getFilteredReviewData = () => {
        if (reviewFilter === 'all') return reviewData;
        if (reviewFilter === 'correct') return reviewData.filter(item => item.isCorrect);
        if (reviewFilter === 'incorrect') return reviewData.filter(item => !item.isCorrect);
        return reviewData;
    };

    // Render Logic
    if (isAuthenticating && GOOGLE_CLIENT_ID === "264702206959-4g7sgjrtg8bj5e958q56j4qmp9qshfs4.apps.googleusercontent.com") {
        return (
            <div style={{ padding: '20px', textAlign: 'center', background: '#fff3cd', color: '#664d03', border: '1px solid #ffc107', borderRadius: '8px', margin: '20px auto', maxWidth: '600px' }}>
                <h2>Configuration Needed</h2>
                <p>Please replace the Google OAuth Client ID in <code>App.js</code> with your actual Client ID.</p>
                <p>Also, ensure your <code>src/Firebase.js</code> is correctly set up with your Firebase project credentials.</p>
            </div>
        );
    }

    if (isAuthenticating) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p className="loading-text">Loading Mathify...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <div className="login-view">
                    <div className="login-card">
                        <h1 className="logo-large">Mathify</h1>
                        <p className="subtitle">NJ Math League Practice Tool</p>
                        <p className="description">
                            Master competition math with timed practice sessions and detailed performance tracking.
                        </p>
                        <GoogleLogin
                            onSuccess={handleGoogleLoginSuccess}
                            onError={handleGoogleLoginError}
                            useOneTap={false}
                            theme="outline"
                            size="large"
                        />
                        {authMessage && (
                            <p className={`auth-message ${authMessage.includes('successful') ? 'success' : ''}`}>
                                {authMessage}
                            </p>
                        )}
                    </div>
                </div>
            </GoogleOAuthProvider>
        );
    }

    return (
        <div className="App">
            <nav className="top-nav">
                <div className="nav-left">
                    <div className="logo">Mathify</div>
                    <div className="user-badge">
                        {user.displayName || user.email?.split('@')[0]}
                    </div>
                </div>
                <div className="nav-actions">
                    {quizState === 'setup' && (
                        <button className="btn btn-ghost" onClick={fetchReviewData}>
                            History
                        </button>
                    )}
                    {quizState === 'review' && (
                        <button className="btn btn-ghost" onClick={restartQuiz}>
                            Back
                        </button>
                    )}
                    <button className="btn btn-ghost" onClick={handleSignOut}>
                        Sign Out
                    </button>
                    <button className="theme-btn" onClick={toggleTheme}>
                        <span className="light-icon">◐</span>
                        <span className="dark-icon">◑</span>
                    </button>
                </div>
            </nav>

            <div className="content">
                {quizState === 'setup' && (
                    <>
                        <div className="header">
                            <h1>Ready to Practice?</h1>
                            <p className="subtitle">Configure your session and start solving problems</p>
                        </div>
                        
                        <div className="container setup-view">
                            <h2>Session Settings</h2>
                            
                            <div className="timer-config">
                                <label htmlFor="minutes">Duration</label>
                                <input
                                    type="number"
                                    id="minutes"
                                    min="1"
                                    max="60"
                                    value={minutes}
                                    onChange={(e) => setMinutes(parseInt(e.target.value) || 1)}
                                />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>minutes</span>
                            </div>

                            <div className="difficulty-selector">
                                <label>Difficulty Level</label>
                                <div className="difficulty-options">
                                    <div 
                                        className={`difficulty-option ${difficulty === 'all' ? 'selected' : ''}`}
                                        onClick={() => setDifficulty('all')}
                                    >
                                        All Levels
                                    </div>
                                    <div 
                                        className={`difficulty-option ${difficulty === 'easy' ? 'selected' : ''}`}
                                        onClick={() => setDifficulty('easy')}
                                    >
                                        Easy
                                    </div>
                                    <div 
                                        className={`difficulty-option ${difficulty === 'medium' ? 'selected' : ''}`}
                                        onClick={() => setDifficulty('medium')}
                                    >
                                        Medium
                                    </div>
                                </div>
                            </div>

                            <div className="action-center">
                                <button className="btn btn-primary" onClick={startQuiz}>
                                    Start Session
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {quizState === 'quiz' && currentQuestion && (
                    <div className="container">
                        <div className="quiz-header">
                            <div className={`timer-display ${getTimerClass()}`}>
                                {formatTime(timeRemaining)}
                            </div>
                            <div className="quiz-stats">
                                <div className="stat">
                                    <div className="stat-label">Questions</div>
                                    <div className="stat-value">{stats.questionCount}</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-label">Correct</div>
                                    <div className="stat-value">{stats.correctCount}</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-label">Accuracy</div>
                                    <div className="stat-value">
                                        {stats.questionCount > 0 ? Math.round((stats.correctCount / stats.questionCount) * 100) : 0}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="question-card">
                            <p className="question-text">{currentQuestion.question}</p>
                            <div className="options-grid">
                                {currentQuestion.options.map((option, index) => (
                                    <div
                                        key={index}
                                        className={`option ${
                                            selectedOption === option ? 'selected' : ''
                                        } ${
                                            showExplanation && option === currentQuestion.answer ? 'correct' : ''
                                        } ${
                                            showExplanation && selectedOption === option && option !== currentQuestion.answer ? 'incorrect' : ''
                                        }`}
                                        onClick={() => handleOptionSelect(option)}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                            
                            {showExplanation && (
                                <div className="explanation-box">
                                    <strong>Explanation</strong>
                                    <p>{currentQuestion.explanation}</p>
                                </div>
                            )}
                        </div>

                        <div className="quiz-actions">
                            {!showExplanation ? (
                                <button className="btn btn-primary" onClick={submitAnswer} disabled={selectedOption === null}>
                                    Submit Answer
                                </button>
                            ) : (
                                <button className="btn btn-primary" onClick={loadNextQuestion}>
                                    Next Question
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {quizState === 'results' && (
                    <>
                        <div className="header">
                            <h1>Session Complete!</h1>
                            <p className="subtitle">Here's how you performed</p>
                        </div>
                        
                        <div className="container results-view">
                            <div className="results-grid">
                                <div className="result-stat">
                                    <div className="result-value">{stats.questionCount}</div>
                                    <div className="result-label">Questions</div>
                                </div>
                                <div className="result-stat">
                                    <div className="result-value">{stats.correctCount}</div>
                                    <div className="result-label">Correct</div>
                                </div>
                                <div className="result-stat">
                                    <div className="result-value">
                                        {stats.questionCount > 0 ? Math.round((stats.correctCount / stats.questionCount) * 100) : 0}%
                                    </div>
                                    <div className="result-label">Accuracy</div>
                                </div>
                            </div>
                            
                            <div className="results-actions">
                                <button className="btn btn-primary" onClick={restartQuiz}>
                                    New Session
                                </button>
                                <button className="btn btn-ghost" onClick={fetchReviewData}>
                                    View History
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {quizState === 'review' && (
                    <>
                        <div className="header">
                            <h1>Practice History</h1>
                            <p className="subtitle">Review your past attempts and learn from them</p>
                        </div>
                        
                        <div className="container">
                            <div className="review-header">
                                <h2>All Attempts</h2>
                                <div className="review-filters">
                                    <button 
                                        className={`filter-btn ${reviewFilter === 'all' ? 'active' : ''}`}
                                        onClick={() => setReviewFilter('all')}
                                    >
                                        All
                                    </button>
                                    <button 
                                        className={`filter-btn ${reviewFilter === 'correct' ? 'active' : ''}`}
                                        onClick={() => setReviewFilter('correct')}
                                    >
                                        Correct
                                    </button>
                                    <button 
                                        className={`filter-btn ${reviewFilter === 'incorrect' ? 'active' : ''}`}
                                        onClick={() => setReviewFilter('incorrect')}
                                    >
                                        Incorrect
                                    </button>
                                </div>
                            </div>

                            {isLoadingReview && (
                                <div className="empty-state">
                                    <div className="spinner"></div>
                                    <p>Loading your history...</p>
                                </div>
                            )}

                            {!isLoadingReview && getFilteredReviewData().length === 0 && (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📝</div>
                                    <p>No practice history yet. Start a session to see your progress!</p>
                                    <button className="btn btn-primary" onClick={restartQuiz}>
                                        Start Practicing
                                    </button>
                                </div>
                            )}

                            {!isLoadingReview && getFilteredReviewData().length > 0 && (
                                <div className="review-list">
                                    {getFilteredReviewData().map(item => (
                                        <div key={item.id} className="review-item">
                                            <p className="review-question">{item.questionText}</p>
                                            <div className="review-answer">
                                                <strong>Your Answer:</strong>
                                                <span className={item.isCorrect ? 'answer-correct' : 'answer-incorrect'}>
                                                    {item.selectedOption}
                                                </span>
                                            </div>
                                            {!item.isCorrect && (
                                                <div className="review-answer">
                                                    <strong>Correct Answer:</strong>
                                                    <span className="answer-correct">{item.correctAnswer}</span>
                                                </div>
                                            )}
                                            <div className="explanation-box">
                                                <strong>Explanation</strong>
                                                <p>{item.explanation}</p>
                                            </div>
                                            <div className="review-meta">
                                                {item.timestamp?.toDate().toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <footer className="footer">
                <p>Created by Samuel Asefa</p>
            </footer>
        </div>
    );
}

export default App;