let strings;

strings = {

    attributeDescriptions : {

        N: `the sample size`,
        p : `a sample proportion`,
        P:  `the "P-value," the probability that, if the null hypothesis were true, we would see a value of the test statistic this extreme.`,
        CImin : `the lower bound to the confidence interval`,
        CImax : `the upper bound to the confidence interval`,
        alpha : `the probability we use to decide if a P-value is "significant." Use significance with caution.`,
        conf : `the value, in percent, used to compute the confidence interval`,
        t : `the t statistic, the z value divided by the square root of N`,
        z : `the z statistic: the difference from the hypothesized value divided by the sample standard deviation`,
        chisq : `the chi-squared statistic. It measures how far a set of counts is from the "expected" value.`,
        F : `the F statistic. It measures how mauch variation is between groups as opposed to within groups.`,
        tCrit : `a critical value for t: the value that corresponds to the probability alpha`,
        zCrit : `a critical value for z: the value that corresponds to the probability alpha`,
        chisqCrit : `a critical value for chi-squared: the value that corresponds to the probability alpha`,
        F : `a critical value for F: the value that corresponds to the probability alpha.`,
        value : `the hypothesized value you are comparing your test statistic to`,
        outcome : `the name of the left-hand (outcome) variable`,
        predictor : `the name of the right-hand (predictor) variable, even if it's not being used to predict anything`,
        procedure : `what kind of statistical procedure was used`,
        SSR : `the sum of squares of residuals calculated between the groups`,
        SSE : `the sum of squares of errors, that is, calculated within the groups relative to the group means`,
        SST : `the total sum of squares, SSR + SSE`,
        dfTreatment : `the degrees of freedom among the groups, i.e., the number of groups minus one.`,
        dfError : `the degrees of freedom within the groups, a little less than the number of cases.`,
        s : `sample standard deviation of the mean`,
        mean : `the mean of the attribute you're looking at`,
        diff : `the difference of means (or proportions) you are studying`,
        prop : `the sample proportion you are studying`,
        SE : `the standard error of the mean (or proportion)`,

    }
}