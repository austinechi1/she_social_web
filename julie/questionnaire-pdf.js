(function () {
  "use strict";

  function clean(value) {
    return String(value || "")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/\u2122/g, " (TM)")
      .trim();
  }

  function collectQuestionnaireData(form) {
    var sections = [];

    form.querySelectorAll("section").forEach(function (section) {
      var heading = section.querySelector("h2");
      var fields = [];

      section.querySelectorAll(".field").forEach(function (field) {
        var label = field.querySelector(":scope > label, :scope > .group-title");
        var controls = Array.from(field.querySelectorAll("input, textarea, select"));
        if (!label || !controls.length) return;

        var values;
        if (controls[0].type === "checkbox") {
          values = controls.filter(function (control) { return control.checked; })
            .map(function (control) { return control.value; });
        } else {
          values = [controls[0].value];
        }

        fields.push({
          question: clean(label.textContent),
          answer: clean(values.filter(Boolean).join(", ")) || "No response provided"
        });
      });

      sections.push({
        title: clean(heading ? heading.textContent : "Questionnaire"),
        fields: fields
      });
    });

    sections.push({
      title: "Permission Confirmation",
      fields: [{
        question: "Permission to use submitted testimonials, images and client results",
        answer: form.querySelector('[name="usage_permission"]').checked ? "Confirmed" : "Not confirmed"
      }]
    });

    return {
      client: "Julie K. Prince",
      completed: new Date().toLocaleString(),
      sections: sections
    };
  }

  function downloadQuestionnairePDF(data) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error("The PDF generator did not load. Please refresh and try again.");
    }

    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ unit: "pt", format: "letter" });
    var pageWidth = doc.internal.pageSize.getWidth();
    var pageHeight = doc.internal.pageSize.getHeight();
    var margin = 52;
    var y = 54;
    var purple = [42, 21, 80];
    var lavender = [126, 90, 173];
    var lime = [234, 246, 165];
    var soft = [78, 64, 103];

    function addHeader(firstPage) {
      doc.setFillColor(purple[0], purple[1], purple[2]);
      doc.rect(0, 0, pageWidth, firstPage ? 118 : 56, "F");
      doc.setFillColor(lime[0], lime[1], lime[2]);
      doc.rect(0, firstPage ? 112 : 50, pageWidth, 6, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(firstPage ? 18 : 11);
      doc.text(firstPage ? "S.H.E. SOCIAL" : "JULIE K. PRINCE - ONBOARDING QUESTIONNAIRE", margin, firstPage ? 50 : 34);
      if (firstPage) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Completed Onboarding Questionnaire", margin, 74);
        doc.text("Prepared for Julie K. Prince", margin, 92);
      }
      y = firstPage ? 148 : 82;
    }

    function ensureSpace(height) {
      if (y + height > pageHeight - 54) {
        doc.addPage();
        addHeader(false);
      }
    }

    addHeader(true);
    doc.setTextColor(soft[0], soft[1], soft[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Completed: " + clean(data.completed), margin, y);
    y += 28;

    data.sections.forEach(function (section, sectionIndex) {
      ensureSpace(48);
      doc.setTextColor(lavender[0], lavender[1], lavender[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text((sectionIndex < 8 ? "SECTION " + String(sectionIndex + 1).padStart(2, "0") + "  " : "") + clean(section.title).toUpperCase(), margin, y);
      y += 22;

      section.fields.forEach(function (field) {
        var questionLines = doc.splitTextToSize(clean(field.question), pageWidth - (margin * 2));
        var answerLines = doc.splitTextToSize(clean(field.answer), pageWidth - (margin * 2) - 16);
        var blockHeight = (questionLines.length * 11) + (answerLines.length * 13) + 24;
        ensureSpace(blockHeight);

        doc.setTextColor(82, 64, 112);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text(questionLines, margin, y);
        y += (questionLines.length * 11) + 6;

        doc.setFillColor(249, 245, 241);
        doc.roundedRect(margin, y - 3, pageWidth - (margin * 2), Math.max(28, answerLines.length * 13 + 12), 3, 3, "F");
        doc.setTextColor(42, 21, 80);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.text(answerLines, margin + 8, y + 10);
        y += Math.max(28, answerLines.length * 13 + 12) + 13;
      });

      y += 8;
    });

    var pages = doc.getNumberOfPages();
    for (var i = 1; i <= pages; i += 1) {
      doc.setPage(i);
      doc.setTextColor(145, 132, 165);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("S.H.E. Social | she-social.com", margin, pageHeight - 24);
      doc.text("Page " + i + " of " + pages, pageWidth - margin, pageHeight - 24, { align: "right" });
    }

    doc.save("Julie-K-Prince-Completed-Onboarding-Questionnaire.pdf");
  }

  window.collectQuestionnaireData = collectQuestionnaireData;
  window.downloadQuestionnairePDF = downloadQuestionnairePDF;
}());
